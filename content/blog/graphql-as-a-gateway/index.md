---
title: GraphQL feat API Gateway
date: '2019-07-01T08:00:00Z'
cover: 'cover.jpg'
---

![Photo by Christian Stahl on Unsplash](cover.jpg)

GraphQL, REST, GRPC, Thrift... Have you ever imagined how to stick these together, in a micro-services architecture, and expose to the world? There are some common ways to do it, such as using Nginx or Kong, but an alternative way to do this is by using GraphQL in front of all services.

## ⏩ API Gateway pattern -- a quick introduction

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

> _For more information on the API gateway pattern, give a look at [nginx micro-services article](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/) and on this [Chris Richardson article](https://freecontent.manning.com/the-api-gateway-pattern/)._

## 🙋 Why GraphQL and not REST?

GraphQL was initially developed by Facebook, [been open-sourced in 2015](https://code.fb.com/core-data/graphql-a-data-query-language/). Many companies started using it for internal APIs, but some are already exposing it as its public API (eg: GitHub, Shopify, Yelp and Contenful).

### Schema validation and documentation

In GraphQL, differently from REST, a schema is always required, following [GraphQL Foundation](https://graphql.org) directives. This allows not only schema validation since day one, but documentation as well. Typed languages can benefit from the schema and generate type definitions through it (eg: [typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator)).

In theory, the same could be done in REST by using OpenAPI/Swagger, specially for documentation ~~but yaml, yikes~~. But, the code generation tools are not exactly the best and sometimes the schema validation do not work properly, requiring extra middlewares and tweaks around it. As GraphQL is standardised in this sense, it doesn't suffer from these issues.

### An endpoint to rule them all

GraphQL only exposes one endpoint, which can be a good and bad thing. Instead of having N client requests, only one is needed, with the server orchestrating everything required to fulfill the whole request -- eg: calling multiple micro-services, in multiple and different protocols (solves under-fetching issues).

One of the caveats of this approach is how to properly rate limit clients, as the queries can be quite complex, with multiple underlying requests, but still being one client request. This means an API user can't be limited through its number of calls anymore, but with something different.

An approach for tackle this is by calculating the query complexity and using it as a rate limit score. [On GitHub API docs](https://developer.github.com/v4/guides/resource-limitations/), there are examples on how they deal with this.

### Out-of-box standards

REST has been around for a long time, and during this period developers started to have specific necessities, such as sparse fieldsets, versioning, pagination. There are a lot of ways of doing these, but none is really a standard (perhaps, the closest thing would be [jsonapi](https://jsonapi.org/)). GraphQL come with some of these specs out-of-box:

- [Sparse fieldset](https://graphql.org/learn/queries/#fields): while making the request, all the required fields need to be specified, avoiding over-fetching
- [Versioning](https://graphql.org/learn/best-practices/#versioning): versioning is not a good practice in GraphQL instead, the schema should continually evolute. New capabilities can be inserted on new types and fields, allowing the client to plan and decide when to change to new resolvers. If a field needs to be deprecated, one can use a directive such as [`@deprecated`](https://www.apollographql.com/docs/graphql-tools/schema-directives).
- [Pagination](https://graphql.org/learn/pagination/): there are some conventions and, for more complex implementations, there is the Connection model pattern.

Of course, there are other stuff which one can compare against REST, but the idea is to show that GraphQL can be an option.

### Developer experience

Front-end and back-end developers can easily settle in a schema and, in a question of minutes, have stubs around it. Besides, code generation, IDE auto-completion, easy documentation/schema discovery and good API exploring tools (such as GraphQL Playground and GraphIQL) makes the development experience way nicer when compared to REST.

## ⚡ GraphQL as your API Gateway

High hopes that you are convinced on trying GraphQL 🙌. Implementing a GraphQL server is not complicated and there are many guides in the web talking about it. [This list](https://graphql.org/code) has server implementations, separated by language.

As teams develop micro-services independently, a strategy is required to expose and change the public facing GraphQL API. There are three main strategies for it:

### Remote schema stitching

The gateway will get the schema from other GraphQL services and then stich it together as the public facing schema. This allows more freedom for teams, but it will disperse the API schema through multiple places, making it harder to test and easier to break, with a chance to have merge/stiching conflict.

Although this can be a problem, teams can make releases without even touching the API Gateway, making the deploys isolated instead of requiring constant API Gateways deploys.

> Recently, Apollo Server implemented [Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/), which will replace remote schema stitching. Bear in mind it is still Apollo specific.

### API Gateway owns schemas

Schema is contained locally on the gateway. This easy the development and test, as everything will be in the same place. The caveat is that the service will be constantly modified by multiple teams (resolvers, schemas), requiring constant gateway releases.

As this service will be constantly modified by multiple people, rules around code formatting and style should be agreed through all teams to make the code uniform.

Personally, I prefer this one as it keeps everything in one place, gives high visibility on what is happening and allow easy discovery of other resolvers.

### Combination of both above

It is possible to mix both strategies, which is specially useful if the team wants to use remote schema stitching but have some services using GRPC or HTTP. Another way to tackle those non-GraphQL services is to put a server in front of it, allowing schema stiching and giving more flexibility for the the responsible team.

## 💡 Conclusion

Hopefully, this might have clarified a bit what to expect from GraphQL as the main gateway. For those who want to go deeper, there are some references below, from where I took notes for this post.

## 📘 References

#### API Gateway

- [Ngnix micro-services book chapter about API Gateway](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/)
- [Chris Richardson article about API Gateway](https://freecontent.manning.com/the-api-gateway-pattern/)
- [API Proxy vs API Gateway](https://stoplight.io/blog/api-proxy-vs-api-gateway-c008c942a02d/)
- [Pattern: API Gateway / Back-end for Front-End](https://microservices.io/patterns/apigateway.html)

#### GraphQL

- [GraphQL Documentation](https://graphql.org/learn/)
- [GitHub GraphQL Resource Limitations Documentation](https://developer.github.com/v4/guides/resource-limitations/)
- [GraphQL Gateway Architectures](https://tomasalabes.me/blog/graphql/node/microservices/2018/08/11/graphql-architectures.html)
- [Why GraphQL: Advantages, Disadvantages & Alternatives](https://www.robinwieruch.de/why-graphql-advantages-disadvantages-alternatives/)
- [Why GraphQL is Taking Over APIs](https://webapplog.com/graphql/)
- [Schema stitching -- Combining multiple GraphQL APIs into one](https://www.apollographql.com/docs/graphql-tools/schema-stitching)
- [Apollo Federation](https://blog.apollographql.com/apollo-federation-f260cf525d21)

#### Tools

- [Typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator)

#### Images

- [Cover Photo by Christian Stahl on Unsplash](https://unsplash.com/photos/8S96OpxSlvg)

#### Other

- [JSONAPI: REST alternative to GraphQL](https://jsonapi.org/)
- [What is over and under-fetching](https://stackoverflow.com/questions/44564905/what-is-over-fetching-or-under-fetching/44568365)
