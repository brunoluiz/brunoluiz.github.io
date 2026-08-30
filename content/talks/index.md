---
title: Talks
description: Meetups and conferences where I have spoken.
date: 2026-08-30
hideMeta: true
disableAnchoredHeadings: true
---

An archive of my meetup and conference talks, from Go release automation to cloud-native infrastructure platforms.

## 2026

### Beyond Terraform

**ContainerDays London 2026**

Most teams implement Infrastructure as Code (IaC) with Terraform, but cloud-native architectures call for a different approach. After using it at J.P. Morgan, I believe [Crossplane](https://www.crossplane.io/) will become a popular open-source choice for building cloud-native platforms.

Crossplane extends the Kubernetes API to manage infrastructure across providers. Engineers can define and manage resources with familiar Kubernetes concepts, turning Kubernetes into a universal infrastructure control plane. This talk covers Crossplane's core concepts, how it compares with Terraform, and how Go can extend it through custom functions and providers.

Topics include:

- Crossplane's core concepts and benefits
- When Crossplane is a better fit than Terraform
- Declarative resource definitions and compositions
- Using Go custom functions to improve composition development
- Building custom providers in Go for more complex cases

[Event details](https://www.containerdays.io/containerdays-london-2026/agenda/) · [Announcement](https://www.linkedin.com/feed/update/urn:li:activity:7428027963859755008/)

## 2023

### ImageWand: Privacy-First Image Conversion with Go & WASM

**May Gophers, 2023**

What if a website could convert images locally, without requiring a server? What if the technology for that already existed? This talk follows the journey from an experiment to ImageWand, a privacy-first image conversion project built with Go and WebAssembly.

[Watch the talk](https://www.youtube.com/watch?v=eo2YNJ9B5qw) · [Event details](https://www.meetup.com/londongophers/events/292486307/?eventOrigin=group_events_list)

## 2020

### Releasing Go Binaries: The Easy Way

**London Gophers, 20 May 2020**

Building Go applications is relatively easy, but releasing them manually can be laborious. This talk introduces [GoReleaser](https://goreleaser.com/) and how it automates the release process, from building binaries to distributing them.

[Watch the talk](https://www.youtube.com/watch?v=oqoDeYu4RBs) · [Event details](https://www.meetup.com/londongophers/events/270380388/?eventOrigin=group_events_list)
