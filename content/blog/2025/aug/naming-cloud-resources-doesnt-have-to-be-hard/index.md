---
title: Naming cloud resources doesn't have to be hard
date: '2025-08-12T10:00:00Z'
summary: 'Most of us have to name “things” daily. Most are easy to change due to refactoring tools, but cloud resources can be impossible at times. We will cover how to avoid major complications by simply re-thinking how you name cloud resources and (hopefully) avoid renames.'
cover:
  image: cover.jpg
  relative: true
  alt: Photo by Jon Tyson on Unsplash
  caption: Photo by <a href="https://unsplash.com/@jontyson?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jon Tyson</a> on <a href="https://unsplash.com/photos/four-markers-on-table-566CgCRSNCk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

---

Most of us have to name “things” daily: variables, functions, services, cloud resources and others. Most are easy to change due to refactoring tools, but cloud resources can be impossible at times. Most vendors require full resource replacement: renaming a database leads to restore/recreate, and a load balancer requires shifting live traffic to a new instance. **We will cover how to avoid major complications by simply re-thinking how you name cloud resources** and (hopefully) avoid renames.

## **Could a naming convention help?**

Since names are difficult to change, teams might settle on a strategy that provides unique names, a human-readable format so that filtering and finding are easy, and makes it simple to parse with automation, among other considerations. **But naming conventions generally fail mainly because we can't predict “the future”**.

Standardised names will follow a pattern that allows “context” around that resource, defined by indicators that exist (eg, type or environment) or might exist in the future (eg, tenant or version). For example, consider a `hello` service needs a Postgres in AWS (RDS), these could be potential names:

- `{{res}}_{{name}}_{{region}}` ⇒ `db_hello_eu-west-1`… but what if it needs other types of databases later (eg, ElasticSearch) and a second instance for an upgrade?
- `{{cloud_res}}_{{name}}_{{version}}_{{region}}` ⇒ `rds_hello_v1_eu-west-1`… but what happens if we have to indicate the many environments and a potential second cloud provider?
- `{{vendor}}_{{env}}_{{cloud_res}}_{{name}}_{{version}}_{{region}}` ⇒  `aws_dev_postgres_hello_v1_eu-west-1`… and so on

There might be even more variations depending on what indicators are desirable. Extra indicators are favoured to give full context around the resource, but they usually backfire, since they become quite long and confusing due to the amount of information in them.

Also, the last example is already quite long (45 characters), and it could be even longer. Cloud vendors or platforms have character limits (eg, AWS S3 ⇒ 63 characters), and it wouldn't be too hard to hit them due to varying indicators (eg, `dev` ⇒ `production`: \+7 characters).

Besides the concerns above, the initial problem still stands: **renaming is hard**. **Naming conventions are fragile since it is hard to predict future changes** (eg, extra indicators). Not only, if more indicators need to be added, the strategy will be broken and a `v2` will be needed, leaving an organised mess behind.

It might still be okay to use a naming convention if kept simple. And that simplicity might lie in non-deterministic names.

![][image1]

## **Non-deterministic names**

What if instead of a complex naming convention, engineers simply used name \+ suffix, such as `<name>-<random_str>`? `hello` could have a database called `hello-cc1dah` and be in a VPC called `private-ec9fhx`. **It sounds crazy to some, but using a short name with a non-deterministic suffix basically turns it into an ID, and IDs shouldn't be updated, solving our initial renaming problem.**

Before you think of using merely IDs, such as UUIDs, without a prefix: not only would it give zero context to your team when navigating in the UI, but most vendors will have limitations around the first character being a letter. So just don't.

Some might argue though that a resource called `hello-cc1dah` in your AWS Console does not give much detail about it. This is because there are better alternatives to provide extra context without overloading the name.

To begin with, indicators such as region, resource type and vendor are pretty much unique to a resource already. Even the environment might be (eg, if the account/project maps to an environment). These are most likely already exported in logs or traces, and search and reporting tools will likely allow filtering by those.

Besides those indicators, how can someone extract further data from `hello-cc1dah`, such as version, tenant, etc? The answer is tagging.

## **Tagging for filtering**

Tags are key/value metadata that can be attached to resources in cloud vendors. Compared to names, they are generally mutable, solving our concerns around future renames.

**Teams can implement a [tagging strategy](https://medium.com/@keeganjustis/why-your-tagging-strategy-matters-on-aws-ab8c3b8335a6) with a common set of required tags that give enough information about a certain resource**. Information such as `name`, `owner`, `version` and `tenant` can be added and leveraged for filtering. They are not only useful to find resources in the console, but also to support operations (logs, traces, automation), billing management, data security and risk management.

Different from names, detecting resources that are non-conformant to the tagging strategy is easier. This is because compliance can be enforced via policies, [either on the vendor](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html) or [on the IaC](https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement/define-policies/opa). When updating resources, the policy will trigger, requiring an engineer to adjust it and add at least a few common tags.

**Once resources have a common set of tags enforced, it is important that those are exported to support operational tools.** For example, observability platforms (eg, Datadog or Grafana) must have the relevant tag information so an engineer can identify `hello-abc` is related to a specific environment or customer.

Bear in mind that some cloud providers can leverage tags to display names for some resources in the Console. [For AWS Compute/Networking resources with `tag:Name`](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#:~:text=The%20console%20might%20organize%20resources%20according%20to%20the%20Name%20tag%2C%20but%20this%20tag%20doesn%27t%20have%20any%20semantic%20meaning%20to%20the%20Amazon%20EC2%20service.), and [Azure resources tagged with `hidden-title`](https://learn.microsoft.com/en-us/community/content/hidden-tags-azure#hidden-title). This can be useful in scenarios where the team wants to give extra context via the name while still keeping mutability as an option.

ℹ️ Even if you don't want to embrace non-deterministic naming, tags are still quite powerful, and I strongly recommend that any company understand how to best use them and implement a basic strategy. AWS has some guides around [tagging strategy](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/building-your-tagging-strategy.html) and [tagging use cases](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-use-cases.html), as well as other vendors. I found “[Why Your Tagging Strategy Matters on AWS](https://medium.com/@keeganjustis/why-your-tagging-strategy-matters-on-aws-ab8c3b8335a6)” a quite comprehensive guide around the topic.

![][image2]

## **What about Infrastructure as Code?**

These changes should not cause too many issues with Infrastructure as Code. If the name of the resource is used elsewhere as a reference, you are already leveraging output features somehow ([Terraform output](https://developer.hashicorp.com/terraform/language/values/outputs)).

**In Terraform/OpenTofu, features such as `terraform_remote_state` and `data` resources can be used to pull outputs from other stacks**, not requiring engineers to reference names directly, and hopefully are already used instead of hard-coding names around. Also, some IaC platforms allow teams to link dependencies and outputs externally, re-syncing stacks automatically after an output change upstream (eg, HashiCorp [Linked Stacks](https://www.hashicorp.com/en/blog/new-in-hcp-terraform-linked-stacks-enhanced-tags-and-module-lifecycle-management) or Spacelift [Stack Dependencies](https://docs.spacelift.io/concepts/stack/stack-dependencies)).

**Just don't feel tempted to use `data` solely through tags.** Tags can change over time, and it might break your infrastructure in the future. An example would be a tag removal or update from the source that causes dependencies to not be able to retrieve it anymore.

## **Conclusion**

If the company already has an existing naming convention, moving away from it or implementing it in tandem might not be easy. **For new projects though, I would suggest considering non-deterministic names paired with a strong tagging strategy**, enforced via policies.

Teams must ensure the relevant tags are exported anywhere engineers might need to filter results for specific resources (billing/observability platforms), and IaC tools can somehow pull the generated name without having to hardcode in its dependent stacks. Otherwise, it can be slightly painful for anyone to identify or use the generated names by this strategy.

[image1]: ./diagram-name1.png

[image2]: ./diagram-name2.png
