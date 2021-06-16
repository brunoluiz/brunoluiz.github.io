---
title: 'A Tale Of How To Not Deploy Two Months Old Features'
date: '2018-03-07T19:44:37.121Z'
description: 'There is one big and very special date on the e-commerce and retail market and it is called Black Friday. For many, it means "discount prices", "sale!", "50% off", but for developers and IT people it is a challenging adventure.'
aliases:
  - /2018/mar/a-tale-of-how-to-not-deploy-two-months-old-features/
---

![Photo by rawpixel.com on Unsplash](cover.jpg)

There is one big and very special date on the e-commerce and retail market and it's called Black Friday. For many, it means "discount prices", "sale!", "50% off", but for developers and IT people it is a challenging adventure.

To begin with, two weeks before, feature deployments are frozen and everything passes through load tests. On the week, machines are scaled up and, at the event's day, all eyes are on metrics and logs.

But there is a catch in this whole story: the feature development can't stop. This means features will begin to stack up soon after the feature deployment freeze and usually it continues a bit after the event, especially when your software is multi-tenant and each client has its own Black Friday agenda.

In the case which gave this article its title, the deploy was delayed until close Christmas and, as it was Christmas, the team preferred to not deploy until the next year.

January came by and, at some point, the delayed deploys would have to start. As four sprints have been passed since Black Friday, the usual process would be to deploy each sprint package atomically, monitoring its results in the production environment. But this, this is not an ideal world.

![Photo by rawpixel.com on Unsplash](surprises.jpeg)

## Product Development Life Is Full Of Surprises

When a product is just in its early days, the first clients are tech early adopters and the development team have to be close to them, as their inputs are valuable.

At some day in January, one of the major platform's clients informed they would launch more shops on the system. Besides the fact that, usually, some preparation is required, the biggest issue was that a specific feature was required. It had been developed at some point, but it was not well tested yet.

Even worse, this feature depended on others, implemented in late November and early December, which means "Goodbye atomic deploys": the team will have to prepare a deploy package with all four sprint features. Dangerous, isn't it? Remember the _challenging adventure_ part?

While finishing and polishing the required feature, the QA team had to work deliberately to test all features again to be sure that everything would be pretty smooth. Even those which were already tested as, since November, some hotfixes were made on the production environment and who knows if they could have affected one of the already tested features.

With the feature finished, the QA and management teams got together to test it. After a period of tests, they confirmed it was working as expected, with no bugs or business rules flaws. Even though this surprise feature made us work insanely, the deploy looked like it would be a walk in the park.

![Photo by SpaceX on Unsplash](deploy.jpeg)

## D(eploy)-Day

It was 2 am when the whole deploy started. Low traffic and not that many orders flooding the system made it the perfect time to deploy the application. While deploying it, everything seemed fine, even though minor adjustments and migrations were needed. As soon as the clock hit 3h30 am, the team members were already wishing "Good Night" to each other.

For a package with a lot of features and one quite critical, it was quite smooth… and this is when things started to fall apart. At 4 pm, one of the clients started to complain about some orders not being registered due to HTTP 400 errors and some inventory not being updated for no reason. *"WHAT THE F*CK IS GOING ON!" \*everybody said, in despair.

All developers stopped to investigate the problem and, of course, hidden in the middle of one of the sprint release packages, there were two bugs: one related to how the application dealt with the inventory queue producer and the other related to how addresses were validated. Ten lines of code worth of trouble.

After roughly one hour of stress, everything was calm again, but the results of this deploy changed the entire team.

![Photo by Dustin Lee on Unsplash](postmortem.jpeg)

## THAT Post-Mortem And Its Results

Soon after, a post-mortem had been written. Everybody collaborated: developers, managers, and QAs. The information contained in this single document would allow the team to learn, grow and know better how to deal with problems like this in the future.

At the other day, a morning meeting was scheduled to discuss the points written in the post-mortem. Besides the issues from the deploy itself, many other problems arose in the heat of the discussion. All members agreed on the pointed issues and suggested some actions to tackle them.

### Deploy age

One could point to the code and say it was a bug, but it was not only that. Deploys that are too many weeks old are a problem, as it has features developed way too long ago, where devs and testers probably don't remember all specifics for these. This can lead to database issues (if a migration was forgotten), schema validation problems, business rules flaws, and so on.

The best way to tackle this is to deploy the feature package not too long after the sprint has been finished. Everything will be fresh for all team members and no git gimmicks will be required for this (rebase hell mostly).

### Rushed deploys

Never do rush deploys, especially big ones. The team will get stressed, communication probably will not be the best, documents (such as the release notes) can have errors or miss information. In this deploy, one of the features was not specified on the JIRA Release Board, but it was on the GitHub release. A developer with more time would have noticed that some stuff was missing.

These release notes usually will not only be used by the clients, but by the QAs as well, as it will have which features will be deployed. As these have impacts on everybody, the best thing to do is to have a consensus on what can be fully delivered (developer side) and well tested (QA side). The idea is to avoid features which can have bugs or not well tested because they were made in a rush.

### Create Processes

Usually, people love to complain about "processes". Some people even say they love startups because of the lack of them. But they exist for a reason and, in this case, it would have helped if everything followed a well-defined process.

There was already a process, but it was not that specific. After the incident, the team got together and wrote a document describing each step of the product feature development, with a pipe of what should be done on each step of it: feature discussions and development, peer reviews metrics, deploy and release notes for tests environments, test processes and finally, the production deploy.

Is it more bureaucratic? For sure! But until now, there were no complains by the team members and, especially, the client.

### More Automated Tests

Each sprint feature package is tested by QAs in a staging environment. The best scenario is to have a lot of different automated test scenarios, which would give 100% guarantee that nothing will break the APIs.

But, this isn't a perfect world. The usual is to have part of it automated and part of it is tested by humans. But, as this aging deploy was urgent and made in a rush, some features passed through without being well tested.

How to solve this problem? Well, one side of the problem is organization: a board tool would help with this but, as aging deploys such as this one have too many tasks, the best thing to do is organize THAT release note. The QA team will be able then to plan how to do its tests.

The other side, which is a bit more complicated, is to create more automated tests. Not only QAs but developers as well. Everybody knows someone who wants to skip the test development, but this can help to avoid countless problems (especially in the future). The other developers should not allow a feature to go on without automated tests for it. The same applies for QAs.

### Error Metrics Monitoring and Alerts

Soon after the deploy, the team has checked some error metrics on [Graylog](https://www.graylog.org) and [CloudWatch](https://aws.amazon.com/cloudwatch/), but these error metrics were just for a part of the system, not its whole. If more metrics had been monitored, probably the problem would have been discovered way before and the impact would have been smaller.

The team should monitor at least some of these metrics manually, through dashboards or even the application log, but the best way to tackle this is through automated alerts. Nowadays, all major IaaS providers have a service for metrics and logs. With CloudWatch (AWS), the team can set alerts for when too many error HTTP responses are given by the applications on a certain determined period. It can send e-mails, SMS and even be integrated with mobile apps such as [OpsGenie](https://www.opsgenie.com/).

There are other tools besides these, such as [NewRelic](https://newrelic.com/) and [Librato](https://www.librato.com/), but they are a bit more specific and the team should analyze if they are really required.

![Photo by Kupono Kuwamura on Unsplash](noproblems.jpeg)

## End Of Problems?

This will not be the last problem the team will have to struggle with. Stressful moments like these will appear but this is when the team will learn and grow, being able to rise and aim towards high stakes through time.
