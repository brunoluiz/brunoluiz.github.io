---
title: Crossplane provider implementation journey
date: '2026-04-14T10:00:00Z'
summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer venenatis, velit luctus porta consectetur, ex sem finibus arcu, malesuada gravida mi enim at tellus'
cover:
  image: cover.jpg
  relative: true
  alt: Photo by Kai Pilger on Unsplash
  caption: Photo by <a href="https://unsplash.com/@kaip?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kai Pilger</a> on <a href="https://unsplash.com/photos/closeup-photo-of-street-go-and-stop-signage-displaying-stop-1k3vsv7iIIc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
aliases:
  - /crossplane-provider/
---

## Introduction

Kubernetes is popular for workload orchestration, but it really shines in how easy it is to extend it. Every time you install a CRD, you are essentially leveraging the controller pattern. The problem with the controller pattern is that it requires teams to create lots of code to orchestrate the lifecycle of a specific resource. Crossplane allows teams to write their own CRDs without having to write controllers for them.

This is possible via compositions and providers, where the former is defined by your team via primarily YAML (although some use Golang) and akin to Terraform “modules” and providers are essentially controllers for Crossplane managed resources (similar to Terraform providers). They are responsible for managing the lifecycle of a specific object, such as “create, update and delete” a Bucket.

Most of the time you might have either an official provider or you can easily generate one via upjet, but sometimes you might need to implement your own. In this post we will cover how providers work and how you can implement your own.

## Crossplane re-cap

This is how Crossplane operates in a nutshell.

\<\< DIAGRAM \>\>

1. Claims: it is what an user “claims”, essentially a custom resource
2. Composite Definition (XRD): defines the composition API, which in turn creates the CRD to be used by the user
3. Composition: defines the orchestration between all components
4. Composite (XR): an object created by the claim which composes all resources
5. Managed Resource (MR): the object that manages the lifecycle of that object against the third-party. It is the “integration part” and what we will tackle when implementing our own provider

## Why create your own provider?

In most cases, you will be able to find an official provider (AWS/GCP) and, but sometimes you won't. There are two options: generate a provider using upjet or implement a provider yourself.

Upjet leverages the Terraform ecosystem and it generates providers that hooks to it. In many cases this is enough, especially for well maintained Terraform providers. Many of the official Upbound and Crossplane providers leverage it and it is a quick way to get started to get a larger infrastructure coverage. But, there are a few caveats:

1. No Terraform provider available for that specific  vendor or incompatibility with Upjet
2. Team wants custom logic between reconciliation logic (eg: emit specific metrics or extra API calls in one interface)
3. More commonly, Upjet performance is poor, resulting in delayed reconcile loops or OOMs, in general linked to the Terraform provider code quality

If you hit one of the above, you might want to consider implementing a provider from scratch but, most importantly, you must know how providers work.

## The reconcile loop

Since Crossplane follows the Kubernetes controller pattern, a provider essentially implements the reconciliation loop. An important aspect, besides the loop itself, is the existence of [`crossplane.io/external-name`](http://crossplane.io/external-name) annotation.

This external name keeps track of the resource ID with the vendor. If not set, the provider must set during its lifecycle, but the user might want to define when applying the resource. This is akin to “terraform import” since, on the first loop, it will find the resource and will hydrate its details into the object status.

Instead of requiring a simple “reconcile” function, provider controllers must implement a strict interface with a few hooks, making it almost an “integration” framework. The lifecycle, order and state is managed by the Crossplane runtime, abstracting away complexities that would generally need to be implemented when using tools such as kubebuilder. Although, **I highly recommend engineers to go at least once through the managed reconciler controller,** since when troubleshooting something that will have most answers.

A provider lifecycle follows these steps:

\< DIAGRAM \>

1. **Setup:** only called when the provider starts up (once), so it is not part of the reconcile loop. In many cases though, it is where the API client will be set up, as sometimes it is not desirable to create a new client on every reconcile loop (eg: in Connect).
2. **Connect:** sets up client connections or anything required for the next steps of the reconciliation process. Different than Setup, this is done per-reconciliation loop and is paired with “Disconnect”.
3. **Observe:** fetches the resource from the third-party API and decide what to do next. It tries to fetch the resource via through the [`crossplane.io/external-name`](http://crossplane.io/external-name) resource annotation and then:
   1. If the annotation does not exist or the the vendor returns “not found”, it triggers `Create`
   2. If the resource exists but differs from the spec, it must trigger `Update`
   3. Else it stores the results in the resource status (it is what you will see on `kubectl describe {cr}/{object-name}`.
4. **Create:** creates it within the vendor and, once finished, it sets the external name in the managed resource object. Once the reconciliation kicks again, Observe will hydrate details to the object status.
5. **Update:** similar to create, but instead it calls update and does not change the external name
6. **Delete:** handles the resource deletion. If the resource still exists on the next reconciliation loop (when Observe gets triggered), it will still try to delete, ensuring no resource is left behind.
7. **Disconnect:** not always required, but in case you have resources that require clean up from the Connect stage (eg: ephemeral database connections), this is the place.

## Anatomy of a provider repository

## Implementation

### Scaffolding

So you are ready to start implementing your custom provider? The Crossplane team maintains a [provider template](https://github.com/crossplane/provider-template), which is a good starting point for most. The README has most instructions on how to set it up and create your first controller (`provider.addType`).

Once you generate your type, you will get a `internal/controller/{}` which is what defines the aforementioned reconciliation hooks. [This is how it will look like.](http://aforementioned.%20)

### Setup

This function is called once on the provider setup and will mostly configure the `controller-runtime` for this specific resource. In general it is *“boilerplatey”*, but I suggest to add a few things here:

1. Inject the `controller.Options Logger` in the `connector` being created, since it is better to use the same logger used by the controller, with the same fields set by it
2. In case opening a connection to your vendor can be expensive / slow, you might want to implement and inject a connection pool map at this stage. An example is a provider that connects to databases and lazily starts a connection at `Connect`, adds to this pool, and re-uses across reconciles, instead of always terminating it at `Disconnect`. **Bear in mind this is in general an optimisation and not always required** since it adds extra complexity (eg: configuring connections timeouts).

### Connect

This is the first function called on the reconciliation loop ([example](https://github.com/crossplane/provider-template/blob/328a8a692f06a0306ffe7623463560fd3633a643/internal/controller/mytype/mytype.go#L120-L162)). Since all further hooks will need a client to be set up, **the provider must set it up at this stage and keep a reference in the generated `external` instance.**

The provider should read the `ProviderConfig` to wire up the auth and other bits for the client setup. Bear in mind that in Crossplane v2 you must detect if the config is at cluster or namespace level.

One thing to note is that some SDKs / clients might require credential injection on every method call (eg: OpenAPI generated). Since they have HTTP Clients underneath, my recommendation is to create a custom HTTP Transport that sets the required auth headers, avoiding further boilerplate.

\< example \>

### Observe

This is one of the most important hooks since it defines what will (or not) be called next. It follows a very simple flow, which needs to be adjusted according to how the integration behaves.

\<DIAGRAM\>

- Hydration / import phase
- How to deal with NotFound
- How to deal with status update
- How to diff current x expected and trigger update

### Create / Update

- Should be brief, since most things are similar
- Point out external name is always required
- Point out status updates are not done here, but instead at Observe phase

### Delete

- Should be similar to above, but explain that, if it returns OK, it will be later checked by Observe and re-triggered if it returns ResourceExists: true

### Disconnect

- Handy depending on what has been set on Connect

### Async operations

- Async operations must return some operation\_id, which must be saved on the provider status
- Observe keeps pooling until this becomes “completed”
- Use LateInitialise to hydrate the missing bits, such as external name
- Cover other use cases for LateInitialise, such as fixing stuff without triggering a create/update

### Gated setup

## Best practices

- Try to get as much information from the ProviderConfig instead of spec (eg: cluster ID)
- Always set external-name to the resource ID – this is akin to “terraform import” and requires the ID to match vendor ID
- Do not call kubernetes client within your code, most likely you are doing something wrong
- You might not need separate cluster and namespaced controllers
- One ProviderConfig per resource

## Making it easier: skills
