---
title: GraphQL as a Gateway
date: '2019-04-03T07:54:37.121Z'
cover: 'cover.jpg'
---

![Photo by Christian Stahl on Unsplash](cover.jpg)

GraphQL, REST, gRPC, Thrift... Have you ever imagined how to glue these together, in a micro-services architecture, and expose to the world? There are some common ways to do it, such as using Nginx or Kong, but an alternative way to do this is by using GraphQL in front of all services.

## API Gateway pattern -- a quick introduction

Considering service A and B, how a client would be able to request it's data? The easiest and straight forward way would be to do a request to service A and another to B, each request pointing to different hosts (eg: `a.service/orders` and `b.service/users`).

As the number of services grow, it is quite laborous to keep up with this strategy, as there could be too many services and requests to coordinate. To solve this, an API proxy can be used, where the client will request to only one service instead of multiple, and this proxy will orchestrate where this request should go, gluing all services in one place.

While proxies just forward requests, API Gateways encapsulate more of the application internal architecture, working as a Facade, with some other responsabilities as well, such as:

- Request/Response Transformation: requests made by a client can be reshaped before sent to internal services, with the same applying to responses
- Request routing: as the proxy, route requests to specific services, translating to other protocols if required
- Composition: one request to the gateway can actually be mapped to multiple internal API requests
- Throttling: limit an user number of requests
- Security: protect some endpoints with some sort of authentication (jwt token, basic, api tokens etc)
- Metrics and Logs: as all requests would pass through it, many metrics and logs will be collected through this service

GraphQL server implementation allow most of these features, but then what is and why GraphQL?

_For more information on the API gateway pattern, give a look at [nginx micro-services article](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/) and on this [Chris Richardson article](https://freecontent.manning.com/the-api-gateway-pattern/)_

## Why GraphQL and not REST?

GraphQL was initially developed by Facebook, [been open-sourced in 2015](https://code.fb.com/core-data/graphql-a-data-query-language/). Many companies started using it for internal APIs, but some are already exposing it as its public API (eg: GitHub, Shopify, Yelp).

### Schema validation and documentation

In GraphQL, differently from REST, a schema is always required, following [GraphQL Foundation](https://graphql.org) directives. This allows not only schema validation since day one, but documentation as well. Typed languages can generate type definitions using the graphql schema (eg: [typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator)).

In theory, the same could be done in REST by using OpenAPI/Swagger (specially for documentation). But, the code generation tools are not exactly the best and usually the schema validation do not work properly, or do not work at all, requiring extra middlewares for it.

### An endpoint to rule them all

GraphQL only exposes one endpoint, which can be a good and bad thing. Instead of having N client requests to request an information, only one is needed, with the server orchestrating everything required to fulfill the whole request -- eg: calling multiple micro-services, in multiple and different protocols.

One of the caveats of the GraphQL approach is how to properly rate limit clients, as the queries can be quite complex, with multiple underlying requests, but still being one client request. A approach for tackle this is limiting by query complexity. [On GitHub API docs](https://developer.github.com/v4/guides/resource-limitations/), there are examples on how they deal with this.

> Should I mention GraphQL DataLoader?

### Out-of-box standards

REST has been around for a long time, and during this period a developers started to have specific necessities, such as sparse fieldsets, versioning, pagination. There are a lot of ways of doing these, none is really a standard. Perhaps, the closest one would be [jsonapi](https://jsonapi.org/), but GraphQL come with some of these specs out-of-box.

- [Sparse fieldset](https://graphql.org/learn/queries/#fields): while making the request, all the required fields need to be specified
- [Versioning](https://graphql.org/learn/best-practices/#versioning): versioning is not a good practice in GraphQL, defending a continuous evolution of the schema instead. New capabilities can be inserted on new types and fiels, allowing the client to request it only when required. If a field needs to be deprecated, one can use a directive such as [`@deprecated`](https://www.apollographql.com/docs/graphql-tools/schema-directives)
- [Pagination](https://graphql.org/learn/pagination/): there are some conventions and, for more complex implementations, there is the Connection model pattern.

Of course, there are other stuff which one can compare against REST, but the idea is to show that GraphQL can be an option.

### Developer experience

## GraphQL as gateway

High hopes that you are convinced about using GraphQL. Implementing it as the gateway is not complicated and

## References

#### API Gateway

- [Pattern: API Gateway / Backend for Front-End](https://microservices.io/patterns/apigateway.html)
- [Ngnix micro-services book chapter about API Gateway](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/)
- [Chris Richardson article about API Gateway](https://freecontent.manning.com/the-api-gateway-pattern/)
- [API Proxy vs API Gateway](https://stoplight.io/blog/api-proxy-vs-api-gateway-c008c942a02d/)

#### GraphQL

- [GraphQL Documentation](https://graphql.org/learn/)
- [GitHub GraphQL Resource Limitations Documentation](https://developer.github.com/v4/guides/resource-limitations/)
- [JSONAPI: REST alternative to GraphQL](https://jsonapi.org/)

#### Tools

- [Typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator)

#### Images

- [Cover Photo by Christian Stahl on Unsplash](https://unsplash.com/photos/8S96OpxSlvg)

#### Other

- https://www.robinwieruch.de/why-graphql-advantages-disadvantages-alternatives/
- https://medium.com/open-graphql/graphql-1-140fab436942
- https://about.sourcegraph.com/graphql/graphql-at-massive-scale-graphql-as-the-glue-in-a-microservice-architecture
- https://webapplog.com/graphql/
- https://philsturgeon.uk/api/2017/01/26/graphql-vs-rest-caching/
