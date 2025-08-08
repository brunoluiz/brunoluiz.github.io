---
title: 'Low downtime Postgres upgrade: the runbook (part II)'
date: '2023-09-03T12:00:00Z'
summary: "No one is really prepared to upgrade big Postgres instances without downtime. This second part will focus on how to do it the lowest downtime possible."
aliases:
  - /2023/may/low-downtime-postgres-upgrade-i-want-to-believe-2/
cover:
  image: cover.jpg
  alt: Photo by Florencia Viadana on Unsplash
  caption: <a href="https://unsplash.com/photos/RIb4BDwiakQ">Photo by Florencia Viadana on Unsplash</a>
---
<!-- https://unsplash.com/photos/RIb4BDwiakQ -->

It is 2023 and upgrading Postgres is still a pain. For those using AWS, there is hope, as they [started to offer blue/green deployments for MySQL][1]. Alas, this is not available for Postgres yet.

[In the first part, I exposed the most reasonable options, what was used for the upgrade and how it went](https://brunoluiz.net/blog/2022/nov/low-downtime-postgres-upgrade-i-want-to-believe/). In this post, you will find a lengthy step-by-step on how to achieve a Postgres zero-downtime upgrade.

## Observations & Limitations

1. The following step-by-step is for a Postgres instance with only one database. It might work for multiple databases, but **logical replications only work against one database at a time**.
2. **Sequence/series data is not replicated.** This means extra steps are required to adjust any column using sequences (included in this guide).
3. **The schema and DDL commands (the ones which alter the schema) are not replicated.** This means a schema freeze is needed during the database replication.
4. **Logical replication [will require rows to have a "replica identity"][13].** This should be a primary key and if all your tables have one it will not be a problem. If you find a table missing one, you will need to set the identity manually or create a primary key. [Read the documentation to understand the trade-offs][13].
5. **Upgrades can't happen if the database already has replication slots:** The team will need to drop existing replication slots by doing `SELECT pg_drop_replication_slot(slot_name)`.

## Pre-setup

There are a few steps you will need to do before even touching Postgres:

1. **Get hold of the cluster admin password**. This is the user that will be used for all operations. In case of doubt, is the one created by default when you create the RDS Cluster (might be hidden in your Terraform state).
2. **Decide which version your team wants to update it to**. Most cloud providers allow you to jump multiple versions (in our case, we went from 10 to 14).
3. **Run a test suite against the desired version and let it soak in development environments for a while.** Although rare, there might be changes that affect your code.
4. **Create a new set of** [**parameter groups**][2] **for the desired version.** It can be done in Terraform ([cluster][3] and [instances][4]) or in the UI. Having it in Terraform makes it easier to replicate these steps later.
5. **Ensure SOURCE and TARGET live in the same network and correctly set outbound/inbound firewalls.** It's trivial, but you never know if someone has changed something manually (our case).
6. **Ensure all tables have replica identity correctly set or have a primary key.**
7. [**Read the AWS Postgres upgrade guide**][5] to get familiarised with its usual process.

## Data integrity

The engineering team could only be confident if we proved that the data integrity was kept after the upgrade. We came up with a few scripts which were consolidated in a tool available at [`processout/pg-upgrade-data-check`](https://github.com/processout/pg-upgrade-data-check).

The script compares data from before the replication and after the replication, comparing the hash of all rows in the between the time the database was replicating. It detected issues multiple times in both testing and production rollouts. The caveat is that it relies on an autoincremental key, not working if your tables don't have one.

In any case, even if this tool does not suit you, **it is very important that the team defines a strategy to prove the data has been kept intact**.

## Preparing the SOURCE for replication

1. The cluster needs to have logical replication enabled. On AWS RDS, [set `rds.logical_replication=1` in parameter groups][6]. The native equivalent [is setting `wal_level=logical`][7]. Once configured, restart the instances (be careful with the order and failovers).
2. Connect to the SOURCE writer instance and confirm that the WAL level is `logical` by running `show wal_level`. If it is not, reboot the SOURCE writer instance.
3. Create a replication role and grant the correct access.

```sql
CREATE USER replicator WITH password 'password'; -- replace this
GRANT rds_replication TO replicator; -- AWS RDS specific
GRANT USAGE ON SCHEMA public TO replicator; -- the default for Postgres is <public>
GRANT <target_database> TO replicator;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO replicator;
```

4. If you have any data integrity script, you should run it now. This is because it will capture the state before you start accumulating WAL.
5. Create a publication: This is used by the target database to subscribe for changes.

```sql
CREATE PUBLICATION pub1 FOR ALL TABLES;
```

6. Create a replication slot: The write operations will be accumulated in this slot. It will spill out the LSN it started to capture, and it might be handy to keep a note of that.

```sql
SELECT pg_create_logical_replication_slot('rep_slot_001', 'pgoutput');
```

7. At this point, you can already see replication slot stats by doing the following queries:

```sql
-- General details about it
SELECT * FROM pg_replication_slots;

-- I mostly used the one below to identify the lag
SELECT slot_name, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(),restart_lsn)) AS replicationSlotLag, active FROM pg_replication_slots;
```

## Create the target database

**The target will be a clone of the source.** If you are unfamiliar with this concept, look at [the RDS Aurora cloning guide][8]. I haven't tested it, but it might also work with native restore.

1. Clone the source database: [the UI makes it very simple][9], but check all parameters set up. [Another way is leveraging Terraform for that][10].
2. Once the clone is finished, check the writer instance logs. You should see one of the three messages:

```sh
... invalid record length at 136/DFC70140: wanted 24, got 0 # usually it always worked with this one
... invalid resource manager ID 48 at 3/1B9AF790
```

This is **the LSN the target writer instance started with: keep note of this**. It will never match the one from the `pg_create_logical_replication_slot` output as more operations went through between its creation and the clone. The LSN output will allow you to indicate Postgres to skip all operations up to a certain point after the upgrade, which is the trick of this process. If you don't set it, you might have duplicated data or unique constraint failures.

Connect to the target and drop the publication and replication slot, as the Aurora clone will also bring those over. **If you don't delete them,** [**the pre-upgrade checks will fail**][11]**.**

```
DROP PUBLICATION pub1;
SELECT pg_drop_replication_slot('rep_slot_001') from pg_replication_slots;
```

**Time to upgrade:** Upgrade to the desired version through the UI or terraform, remembering to double-check all the pre-filled settings. **Remember that you need a new set of parameter groups, as each version has its own (pre-setup step 4).** The upgrade will likely take 15-20 minutes.

Once finished, check if the writer's `show wal_level` is set to `logical`. If not, an extra restart will be required on the writer. This was an issue (probably an AWS bug) in all upgrades.

Before the final steps, don't forget the following:

1. **Run `ANALYSE`:** All table statistics are wiped after an upgrade. Those are used to plan queries correctly, and Postgres' performance might be terrible without them.
2. **Run `VACUUM`:** This is optional, but if it has been a while since it has been done, this is an excellent opportunity (no live traffic).
3. **Run benchmarks:** Pick the heaviest and most frequent queries and run some benchmarks against them (post-ANALYSE). The results should be the same, if not better.

## Setup replication between SOURCE and TARGET

At this point, around 1-2 hours have passed since the replication slot creation. Your clone only has the data until that point. The following steps will flush all operations from the SOURCE into the TARGET, and at the end, both databases should have the same dataset.

1. **Create the subscription in the target Postgres.** You must replace all `$` with the correct values. Depending on your Postgres logging setup, **this command might be logged with the plain password (`log_statement=ddl`, [for example][12])**. The team might be fine to have this password leaked in logs during the whole upgrade process, but remember to delete the account afterwards.

```

CREATE SUBSCRIPTION sub1 CONNECTION 'host=$source_url user=replicator dbname=$db_name password=$replicator_password' PUBLICATION pub1 WITH (
    copy_data = false, -- disable initial COPY
    create_slot = false, -- disable replication_slot creation on PUBLISHER
    enabled = false, -- disabled by default, as we want to tweak the LSN
    connect = true, -- try to connect to the SOURCE
    slot_name = 'rep_slot_001' -- change this according to the replication slot used
);

```

2. Check if there were no network or access issues through the Postgres logs. Sometimes, it simply hangs on the `CREATE SUBSCRIPTION` if the SOURCE can't be reached **(see pre-setup step 5)**.
3. Advance the SUBSCRIPTION LSN to the value returned on the TARGET boot. As already observed, this will skip operations that would result in duplicated data. **The caveat is that the LSN returned there is sometimes a bit ahead of what it should be, resulting in skipped legit operations. That is why having a data integrity script is very important!**

```
SELECT pg_replication_origin_advance(
    (SELECT 'pg_'||oid::text AS "external_id" FROM pg_subscription WHERE subname = 'sub1' LIMIT 1),
    $LSN_FROM_STEP_1
);
```

4. Enable the subscription by executing `ALTER SUBSCRIPTION sub1 ENABLE;`.
5. On the SOURCE, observe the replication slot statistics. It will show the WAL logs being consumed, with the lag between the current LSN and slot LSN decreasing.

```sql
SELECT slot_name, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(),restart_lsn)) AS replicationSlotLag, active FROM pg_replication_slots;
SELECT * FROM pg_stat_replication;
```

6. The operations will have been all flushed once the lag is around kilobytes. **Run your data integrity scripts at this point, as both should contain the same data (with a minor lag).**

## Finishing the process: the switch

At this point, both databases will have the same dataset. All this can be done during work hours, while the switch can be done during off-peak.

You can monitor its progress by using one of the following queries:

```sql
--
-- General sync state
--

-- Q1: Size per table (useful to spot discrepancies after syncing)
SELECT table_name, pg_relation_size(quote_ident(table_name)), pg_size_pretty(pg_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY 2 DESC;

-- Q2: Total table sizes without indexes (useful to spot discrepancies after syncing)
SELECT SUM(pg_relation_size(quote_ident(table_name))) FROM information_schema.tables WHERE table_schema = 'public';

--
-- SOURCE setup
--

-- Q3 & Q4: Details about the SOURCE publication
SELECT * FROM pg_publication;
SELECT * FROM pg_publication_tables;

-- Q5: Get SOURCE LSN (useful to compare with the TARGET LSN)
SELECT pg_current_wal_lsn();

--
-- SOURCE monitoring
--

-- Q6: Lag between publisher x subscriber
SELECT slot_name, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(),restart_lsn)) AS replicationSlotLag, active FROM pg_replication_slots;

-- Q7: Data about replication slots
SELECT * FROM pg_replication_slots;

-- Q8: Data about SOURCE replication status (like lag & current state)
SELECT * FROM pg_stat_replication;

--
-- TARGET monitoring
--

-- Q9: Active subscription state and configs (similar to pg_publicationn on the SOURCE)
SELECT * FROM pg_subscription;

-- Q10: Details on active TARGET subscriptions
SELECT * FROM pg_stat_subscription;

-- More here: https://dba.stackexchange.com/questions/314324/monitor-logical-replication-using-lsn
```

Every company has a different setup, but this is what will be required in broad lines:

1. **Stop incoming traffic to the database:** scale down the application using it or create a circuit breaker where it is being used.
2. **Change environment variables:** point to the new database
3. **Wait for flush:** there might be some in-flight WAL logs. Refer to the above queries to monitor the progress. Ideally the replication slot should be almost empty (around * kB of data)
4. **Disable subscription:** `ALTER SUBSCRIPTION sub1 DISABLE;`
5. **Sync all fields using a sequence:** doing this through a SQL script is recommended, as more time spent here = more downtime. The following script can be used

```bash
# Creates script
cat << EOT >> ./fix_sequences.sql
SELECT 'SELECT SETVAL(' || quote_literal(s.sequence_schema || '.' || s.sequence_name) || ', COALESCE(MAX(id), 1)) FROM ' || quote_ident(t.table_schema) || '.' || quote_ident(t.table_name) || ';' as sql
FROM information_schema.sequences s
JOIN information_schema.tables t ON t.table_name = REPLACE(sequence_name, '_id_seq', '') AND t.table_schema = s.sequence_schema
ORDER BY sequence_name ASC;
-- This could be used as well: https://wiki.postgresql.org/wiki/Fixing_Sequences
-- But it missed some sequences when I tried
EOT

# Query database and generate sequences to be fixed
psql -Atq -f ./fix_sequences.sql -o ./fix_sequences.gen.sql $target_url
psql -f ./fix_sequences.gen.sql $target_url
```

6. **Restart traffic to the database:** If everything goes right, you should be ready to re-enable connections to it.

Between (5) and (6), you can set up a "reverse logical replication", which might help in case of rollback. SOURCE becomes the TARGET, and TARGET becomes the SOURCE. If you want to set this up, script it so you can reduce downtime.

## The end?

If everything goes right, no data is lost, and there is minimal downtime, the team and stakeholders will be happy. This is a reminder: Postgres releases new versions yearly, and AWS will keep phasing old versions out annually. Until a major upgrade allows an easier upgrade path, be prepared for this process more than once in your lifetime 🥲

[1]: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/blue-green-deployments.html
[2]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/parameter-groups-overview.html
[3]: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster_parameter_group
[4]: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_parameter_group
[5]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.PostgreSQL.html#USER_UpgradeDBInstance.PostgreSQL.MajorVersion.Process
[6]: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Replication.Logical.html#:~:text=In%20the%20Parameters%20search%20field%2C%20type%20rds%20to%20find%20the%20rds.logical_replication%20parameter.%20The%20default%20value%20for%20this%20parameter%20is%200%2C%20meaning%20that%20it%27s%20turned%20off%20by%20default.
[7]: https://www.postgresql.org/docs/current/runtime-config-wal.html
[8]: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Managing.Clone.html
[9]: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Managing.Clone.html#Aurora.Managing.Clone.create
[10]: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster#restore_to_point_in_time-argument-reference
[11]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.PostgreSQL.html#USER_UpgradeDBInstance.PostgreSQL.MajorVersion.Process:~:text=Handle%20logical%20replication%20slots
[12]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.PostgreSQL.html#:~:text=Logs%20all%20data%20definition%20language%20(DDL)%20statements%2C%20such%20as%20CREATE%2C%20ALTER%2C%20DROP%2C%20and%20so%20on.
[13]: https://www.postgresql.org/docs/current/logical-replication-publication.html#:~:text=By%20default%2C%20this%20is%20the%20primary%20key%2C%20if%20there%20is%20one.%20Another%20unique%20index%20(with%20certain%20additional%20requirements)%20can%20also%20be%20set%20to%20be%20the%20replica%20identity.%20If%20the%20table%20does%20not%20have%20any%20suitable%20key%2C%20then%20it%20can%20be%20set%20to%20replica%20identity%20FULL%2C%20which%20means%20the%20entire%20row%20becomes%20the%20key.
