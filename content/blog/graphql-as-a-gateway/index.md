---
title: GraphQL feat API Gateway
date: '2019-07-01T08:00:00Z'
cover: './cover.jpg'
---

![Photo by Christian Stahl on Unsplash](cover.jpg)

GraphQL, REST, gRPC, Thrift... Have you ever imagined how to stick these together in a micro-services architecture and expose to the world? There are some common ways to do it, such as using Nginx or Kong. But, an alternative way to do this is by using GraphQL in front of all services.

## ⏩ API Gateway pattern -- a quick introduction

Consider two services: A and B. How a client would be able to request its data? The easiest and straight forward way would be to do a request to service A and another to B, each request pointing to different hosts (eg: `a.service/orders` and `b.service/users`).

As the number of services grows, it is quite laborious to keep up with this strategy. Since there could be too many services and requests to coordinate. To solve this, an API proxy can be used, where the client will request to only one service instead of multiple. This proxy will orchestrate where this request should go, glueing all services in one place.

While proxies just forward requests, API Gateways encapsulate more of the application internal architecture. Working as a Facade with some other responsibilities, such as:

- Request/Response Transformation: requests made by a client can be reshaped before sent to internal services, with the same applying to responses.
- Request routing: as the proxy, route requests to specific services, translating to other protocols if required.
- Composition: one request to the gateway can actually be mapped to multiple internal API requests.
- Throttling: limit user requests up to a determined rate limit.
- Security: protect some endpoints with some sort of authentication (JWT token, basic, API tokens etc).
- Metrics and Logs: as all requests would pass through it, many metrics and logs will be collected through this service.

> For more information on the API gateway pattern, take a look at [Nginx micro-services article](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/) and on this [Chris Richardson article](https://freecontent.manning.com/the-api-gateway-pattern/).

## 🙋 Why GraphQL and not REST?

GraphQL was initially developed by Facebook and [was open-sourced in 2015](https://code.fb.com/core-data/graphql-a-data-query-language/). Many companies started using it for internal APIs, but some are already exposing it as its public API (eg: GitHub, Shopify, Yelp and Contentful).

### Schema validation and documentation

With GraphQL, in contrast to from REST, a schema is always required, following [GraphQL Foundation](https://graphql.org) directives. This allows not only schema validation from day one, but documentation too. Typed languages can benefit from the schema and generate type definitions through it (eg: [typescript graphql-code-generator](https://github.com/dotansimha/graphql-code-generator)).

```graphql
type Query {
  """
  Fetch posts by user, allowing custom filtering
  """
  posts(input: PostQueryInput): [Post]
}

input PostQueryInput {
  categoryId: String
}

"""
Post bla bla bla
"""
type Post {
  title: String
  categories: [Category]
}

type Category {
  name: String
}
```

In theory, the same could be done with REST by using OpenAPI/Swagger, especially for documentation ~~but yaml, yikes~~. But, the code generation tools are not exactly the best and sometimes the schema validation does not work properly, requiring extra middleware and tweaks around it. As GraphQL is standardised in this sense, it doesn't suffer from these issues.

### One endpoint to rule them all

GraphQL only exposes one endpoint. Instead of having N client requests, only one is needed. The server orchestrates everything required to fulfil the whole request, such as: calling multiple micro-services (with any protocol), mapping outputs to the expected schema and logging requests/responses. Besides, this solves [under-fetching issues](https://stackoverflow.com/questions/44564905/what-is-over-fetching-or-under-fetching/44568365).

### Out-of-box standards

REST has been around for a long time, and during this period developers started to have specific necessities, such as sparse fieldsets, versioning, pagination. There are many ways to implement these features but there aren't really any standards (the closest solution is [JSONAPI](https://jsonapi.org/)). GraphQL comes with some of these specs out-of-box:

- [Sparse fieldset](https://graphql.org/learn/queries/#fields): while making the request, all the required fields need to be specified, avoiding over-fetching
- [Versioning](https://graphql.org/learn/best-practices/#versioning): route versioning is not a good practice in GraphQL instead, the schema should continually evolve. New capabilities can be inserted on new types and fields, allowing the client to plan and decide when to change to new resolvers. If a field needs to be deprecated, one can use a directive such as [`@deprecated`](https://www.apollographql.com/docs/graphql-tools/schema-directives).
- [Pagination](https://graphql.org/learn/pagination/): there are some conventions and, for more complex implementations, there is the Connection model pattern.

Of course, there is other stuff tjat one can compare against REST, but the idea is to show that GraphQL can be an option.

### Developer experience

Front-end and back-end developers can easily settle on a schema and, in a question of minutes, have stubs built around it. Besides, code generation, IDE auto-completion, easy documentation/schema discovery and good API exploring tools (such as GraphQL Playground and GraphiQL) makes the development experience way nicer when compared to REST.

## ⚡ GraphQL as your API Gateway

High hopes that you are convinced on trying GraphQL 🙌 Implementing a GraphQL server is not complicated and there are many guides on the web talking about it. The official website [has a list with many server frameworks and libraries](https://graphql.org/code) (comes in many flavours).

As mentioned in the first section, an API Gateway has some specific responsibilities. As GraphQL is implemented on top of a normal web server application, one can easily add some of these to it, such as authorisation, metrics and logging. Things such as requests/response transformation, routing and composition are done in the GraphQL resolver level, mapping calls to the right services, using the right communication protocols.

> Even before going full micro-services and using it as a real API Gateway, companies can easily develop everything on top of a GraphQL monolith ~~wait, don't leave yet~~ and then, with more time and planning, redirect the resolvers to micro-services. This is particularly useful for small companies, which are still testing ideas. During the migration, back-end might change a lot, but front-end will be able to continue requesting the same stuff.

As teams develop micro-services, a strategy is required to expose and change the public facing GraphQL schema. There are some known strategies for it:

### Remote schema stitching

The gateway will get the schema from other GraphQL services and then stitch them together as the public-facing schema. This allows more freedom for teams, but it will disperse the API schema through multiple places, making it harder to test and easier to break, with a chance to have merge/stitching conflict.

Although this can be a problem, teams can do releases without even touching the API Gateway, making the deploys isolated instead of requiring constant API Gateways deploys.

> Recently, Apollo Server implemented [Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/), which will replace remote schema stitching. Bear in mind it is still Apollo specific.

### API Gateway owns schemas

The Schema is contained locally on the gateway. This makes development and testing easier, as everything will be in the same place. The caveat is that the service will constantly be modified by multiple teams (resolvers, schemas), requiring constant gateway releases.

As this service will be constantly modified by multiple people, rules around code formatting and style should be agreed through all teams to make the code uniform.

> Personally, I prefer this one as it keeps everything in one place, gives high visibility on what is happening and allows easy discovery of other resolvers.

### Combination of both above

It is possible to mix both strategies, which is especially useful if the team wants to use remote schema stitching but have some services using gRPC or HTTP. Another way to tackle those non-GraphQL services is to put a server in front of it, allowing schema stitching and giving more flexibility for the responsible team.

## 🙉 Caveats of using GraphQL

### Services can get a bit chatty

On the request below, a user wants all posts with its associated author.

```graphql
query {
  posts(authorId: "bruno") {
    title
    author {
      name
    }
  }
}
```

The issue is, due to the nature of GraphQL, each resolved `post` will call the `author` resolver, resulting in `N-1` unnecessary calls. Using SQL, it would give us:

- `Query.posts` are resolved: `SELECT title, author_id FROM posts`
- `Query.posts` still have un-resolved data about `Post.author.name`. For each item, GraphQL will call `Post.author` resolver
- Post A calls `Post.author` resolver: `SELECT * FROM authors WHERE author_id = 'bruno'`
- Post B calls `Post.author` resolver again with same query
- Post C calls `Post.author` resolver again with same query
- ...

The two first selects would have returned the required data, but due to how GraphQL resolvers work -- each resolved item with missing data calls the subsequent resolver -- all these extra calls are made. This is where [DataLoader](https://github.com/graphql/dataloader) pattern shines.

Using batching and a cache (per-request only), it will lead your back-end only needing to make the right amount of calls. Probably even saving you from more calls, as `author` could have other resolvers to be called. In the previous example it would do something like:

- `Query.posts` are resolved: `SELECT title, author_id FROM posts`.
- `Query.posts` still have un-resolved data about `Post.author.name`. For each item, the service would add a call to DataLoader with the required `author_id`.
- After passing through all items, DataLoader would only execute `SELECT * FROM authors WHERE author_id = 'bruno'` query and return the response.

The JavaScript implementation is under 400 LOC, making it easier to explore and understand how it actually works. [There are implementations in other languages as well](https://github.com/graphql/dataloader/blob/master/README.md#other-implementations).

> MPJ, from FunFunFunction, released a [video series](https://www.youtube.com/watch?v=lAJWHHUz8_8&list=PL0zVEGEvSaeEjIDdbK1KfR7V9XBCVAr0P) on how to implement GraphQL in NodeJS. [Watch the DataLoader video here](https://www.youtube.com/watch?v=--AguZ20lLA&list=PL0zVEGEvSaeEjIDdbK1KfR7V9XBCVAr0P&index=3).

### Throttling is not easy as REST

Having everything in one endpoint makes harder to properly implement rate limits because the queries can be quite complex with multiple underlying requests but still one client request. This means an API user can't be limited through its number of calls to a certain endpoint anymore.

An approach to tackle this is by calculating the query complexity and using it as a rate limit score. [On GitHub API docs](https://developer.github.com/v4/guides/resource-limitations/), there are examples of how it works. But, this doesn't come out-of-box in most server implementations 😞 There are some packages such as [`graphql-validation-complexity`](https://github.com/4Catalyzer/graphql-validation-complexity) and [`graphql-cost-analysis`](https://github.com/pa-bru/graphql-cost-analysis), where the latter is more advanced, with more options to limit the upcoming queries.

```graphql
# Usage example of graphql-cost-analysis
type Query {
  # the cost will depend on the `limit` parameter passed to the field
  # then the multiplier will be added to the `parent multipliers` array
  customCostWithResolver(limit: Int): Int
    @cost(multipliers: ["limit"], complexity: 4)

  # for recursive cost
  first(limit: Int): First
    @cost(multipliers: ["limit"], useMultipliers: true, complexity: 2)

  # You can specify several field parameters in the `multipliers` array
  # then the values of the corresponding parameters will be added together.
  # here, the cost will be `parent multipliers` * (`first` + `last`) * `complexity
  severalMultipliers(first: Int, last: Int): Int
    @cost(multipliers: ["first", "last"])
}
```

### Caching is magic until it isn't

Most clients do caching automatically, but sometimes it doesn't work as expected, requiring some manual cleaning on the client. Besides, each request might ask for different fields, which makes a bit trickier to cache a resource on the server-side. One might request the whole resource, cache it in memory (eg: redis), and then allow the API to use it as a reference to select specific fields.

## 💡 Conclusion

Hopefully, this might have clarified some details of using GraphQL as an API gateway. For those who want to go deeper, there are some references below, from where I took notes for this post.

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
- [FunFunFunction GraphQL Videos](https://www.youtube.com/watch?v=lAJWHHUz8_8&list=PL0zVEGEvSaeEjIDdbK1KfR7V9XBCVAr0P)

#### Tools

- [Typescript `graphql-code-generator`](https://github.com/dotansimha/graphql-code-generator)
- [DataLoader](https://github.com/graphql/dataloader)
- [`graphql-validation-complexity`](https://github.com/4Catalyzer/graphql-validation-complexity)
- [`graphql-cost-analysis`](https://github.com/pa-bru/graphql-cost-analysis)

#### Images

- [Cover Photo by Christian Stahl on Unsplash](https://unsplash.com/photos/8S96OpxSlvg)

#### Other

- [JSONAPI: REST alternative to GraphQL](https://jsonapi.org/)
- [What is over and under-fetching](https://stackoverflow.com/questions/44564905/what-is-over-fetching-or-under-fetching/44568365)
