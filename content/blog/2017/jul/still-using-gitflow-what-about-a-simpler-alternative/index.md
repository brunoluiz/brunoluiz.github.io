---
title: 'Still using GitFlow? What about a simpler alternative?'
date: '2017-07-18T19:44:37.121Z'
cover: header.jpeg
summary: 'GitFlow is a branching model created by Vincent Driessen on 2010. Since it was published, many companies had tested and implemented it, which allows us to have many reviews about how well (or not) it works. After some discussions within our team, we decided to not go with GitFlow, but use a simpler model instead, together with a tightly defined workflow.'
---

![Alternative on sight](header.jpeg)

GitFlow is a branching model created by Vincent Driessen on 2010 ([original article](http://nvie.com/posts/a-successful-git-branching-model/)). Since it was published, many companies had tested and implemented it, which allows us to have many reviews about how well (or not) it works. After some discussions within our team, we decided to not go with GitFlow, but use a simpler model instead, together with a tightly defined workflow. Some of the discussed reasons of why not go with GitFlow are the same written on [this blog post](http://endoflineblog.com/gitflow-considered-harmful).

## The Feature Branch Model

Compared to GitFlow, it is easier to implement and does not require any plugins to be properly used. The step-by-step of this model would be:

1. Create a branch from the master (feature-x), which is where the feature will be developed: `git checkout -b feature-x`

1. Push the branch to the remote: `git push -u origin feature-x`. With the branch in the remote repo, a pull request should be opened with it ([How to open it in GitHub](https://help.github.com/articles/creating-a-pull-request/)). A pull request is where all modifications are available to other members and they will be able to review it

1. Fix the reviewed code and wait for approval. If a new release on the master generates a conflict, a best practice would be to rebase it (instead of merging)

1. (optional) If a rebase is needed: checkout to master `git checkout master`, pull the changes `git pull`, go back to the feature branch `git checkout feature-x`, do the rebase `git rebase master` and then sync the rebased branch `git push --force-with-lease`. [A good tutorial about merging x rebasing is available on this Atlassian article](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).

1. If there are no conflicts and it was approved ⇒ **squash + merge**

[This Atlassian article have a more detailed view on the feature branch model](https://www.atlassian.com/git/tutorials/comparing-workflows#feature-branch-workflow)

### Why Squash + Merge instead of just Merge?

The squash and merge is made up of two processes: the squash, which compact all commits in one big commit/patch, and then the merge itself. After squashing + merging, you will have only one commit in the target branch (usually master) containing all your modifications. This enables two things:

1. It is easier to move this feature, as the whole patch/feature will be on one commit hash

1. The target branch will be cleaner, less messy and more readable — without those 67 commits you have made to finish the feature.

There are more information about [about why devs prefers squash and merge, instead of only merging, on this article](https://softwareengineering.stackexchange.com/questions/263164/why-squash-git-commits-for-pull-requests).

## Managing release versions with git tags

In the feature branch model, a merge is considered a new version release. To track each release version, tags can be used. These will be used as reference to choose which version should be deployed at the servers.

To manage these tags/release, a good practice is the usage of [\*semantic versioning](http://semver.org):\*

> Given a version number **MAJOR.MINOR.PATCH**, increment the:
>
> 1. MAJOR version when you make incompatible API changes,
> 2. MINOR version when you add functionality in a backwards-compatible manner, and
> 3. PATCH version when you make backwards-compatible bug fixes.

The process to create the releases can be automated using [`grunt-release`](https://github.com/geddski/grunt-release) or [`gulp-release-tasks`](https://github.com/lfender6445/gulp-release-tasks). But, following the steps bellow, it can be easily done by hand:

1. Checkout to the master branch: `git checkout master`

1. Pull changes from the remote `git pull`

1. Get the most recent tag using `git describe --abbrev=0` (let's say it returns v0.1.0)

1. Create a tag using `git tag -a <version>`⇒`git tag -a v0.2.0`

1. Push the modifications and the tag: `git push origin v0.2.0 --follow-tags`

1. Done!

## Deploying

In many PaaS, such as AWS Beanstalk or Heroku, a remote repository is set-up where, when changes are pushed (eg. git push heroku master), a deploy is triggered using the latest commits on master. In these cases, a simple push force using the release tag will deploy the desired version: `git push -f <deploy/env-remote> v0.2.0:master`. Easy, eh?

> NOTE: At Chaordic New Offers Team, a grunt script was developed where we publish which tag should be deployed: `grunt deploy:<version>:<env>:all`

## What happens if a hot-fix is needed?

At some point, an issue will be raised and the production version will need a hot-fix _ASAP_. A feature branch can't just be opened to develop a fix, as the master will probably be ahead of the production version. In this case, the fix needs to be done directly on the production version:

1. Checkout to the production version tag `git checkout v0.10.0`

1. Create a new branch from this tag `git checkout -b hotfix-v0.10.1-weirdbehavior`

1. Create the fix and commit it

1. Create a tag for this new release `git tag -a v0.10.1` (notice the SEMVER pattern)

1. Push the branch and tag to remote `git push -u origin hotfix-v0.10.1-weirdbehavior --follow-tags`

1. Deploy the tag `v0.10.1` to the production environment

1. A push request should be opened, as the fix should be applied at the master afterwards

If more patches are needed, this process can be repeated on the same version, incrementing only the patch version.

### What about applying it to other environments?

This patch probably should be applied to other environments as well, which can be done through [git cherry-pick](http://think-like-a-git.net/sections/rebase-from-the-ground-up/cherry-picking-explained.html) <commit-hash> . It basically applies the chosen commit to the actual HEAD.

1. Checkout to the environment version tag `git checkout v0.13.0`

1. Create a new branch for the patch `git checkout -b hotfix-v0.13.1`

1. Do a `git cherry-pick v0.10.1` or a `git cherry-pick <commit-hash>` to apply the desired commit

1. `git tag -a v0.13.1` and `git push origin v0.13.1` (push just the tag)

1. Deploy it

### What if I want to get a modification from master and sent to one of the environments?

It is very similar to the above one: a `git cherry-pick` should be done using a commit hash from the master as, after **squash + merge** a push request, a new commit is generated with all changes (big patch of commits condensed in one).

## Just keep in mind…

The gap between the environments versions should be as short as possible. Otherwise, some issues may appear:

- If the production is on `v0.1.10`, the latest release is `v0.10`, but the version `v0.3` will be deployed: the team members will have to check if some of the production patches are still required and then apply them, one by one.

- If some feature was only finished on `v0.10.0`, and it is required for the roll-out, but the `v0.7.0` is still not well tested: the release should be hold until the `v0.7.0` has been tested

Usually, these version gaps occur when the producing capacity is higher than the testing capacity (developers x testers ratio).

## Conclusion

The model is still being tested but, until now, it has been working well. The only faced drawbacks were the ones pointed on the session above.
