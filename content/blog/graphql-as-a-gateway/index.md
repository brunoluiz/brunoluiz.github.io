---
title: GraphQL as a Gateway
date: '2019-04-03T07:54:37.121Z'
cover: 'cover.jpg'
---

![Photo by Christian Stahl on Unsplash](cover.jpg)

GraphQL, REST, gRPC, Thrift... Have you ever imagined how to glue these together, in a micro-services architecture, and expose to the world? There are some common ways to do it, such as using Nginx or Kong, but an alternative way to do this is by using GraphQL in front of all services.

## API Gateway pattern -- a quick introduction

Considering service A and B, how a client would be able to request it's data? The easiest and straight forward way would be to do a request to service A and another to B, each request pointing to different hosts.

The problem is, as the number of services grow, it is quite laborous to keep up with this strategy. To solve this, a proxy can be used, where the client will request to only one host instead of multiple, and this proxy service will orchestrate where this request should go, gluing all services in one place.

API Gateways work as a proxy, but with some extras: caching, request transformation, throttling, security and others. GraphQL servers, been usually normal services, are highly configurable and can offer these as well.

## Why GraphQL and not REST?

The gateway pattern is kinda well known, but why would a company opt by GraphQL instead of REST?

### Schema validation and documentation

In GraphQL, differently from REST, a schema is always required, following GraphQL Foundation directives. This allows not only schema validation since day 1, but documentation as well. Usually typed languages can generate type definitions using the graphql schema (example: [typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator))

In theory, the same could be done in REST by using OpenAPI/Swagger (specially for documentation), but the code generation tools are not exactly the best and usually the schema validation do not work properly (or do not work at all).

### One endpoint, multiple queries

GraphQL only exposes one endpoint. With this, instead of having N client requests to properly get an information, in GraphQL only one is needed, with the server orchestrating everything required to fulfill the request.

The caveats with this are: how to deal with bulk queries and how to properly rate limit clients.

- https://developer.github.com/v4/guides/resource-limitations/

### Out-of-box standards

- Sparse fieldset
- Versioning

### Developer experience

## References

- [Photo by Christian Stahl on Unsplash](https://unsplash.com/photos/8S96OpxSlvg)
- [Pattern: API Gateway / Backend for Front-End](https://microservices.io/patterns/apigateway.html)
- [API Proxy vs API Gateway](https://stoplight.io/blog/api-proxy-vs-api-gateway-c008c942a02d/)

- https://www.robinwieruch.de/why-graphql-advantages-disadvantages-alternatives/
- https://medium.com/open-graphql/graphql-1-140fab436942
- https://about.sourcegraph.com/graphql/graphql-at-massive-scale-graphql-as-the-glue-in-a-microservice-architecture
- https://webapplog.com/graphql/
- https://philsturgeon.uk/api/2017/01/26/graphql-vs-rest-caching/
