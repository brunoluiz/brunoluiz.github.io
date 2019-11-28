---
title: 'Joi: validate input and define databases in JavaScript'
date: '2017-08-30T19:44:37.121Z'
cover: header.jpeg
summary: 'As the saying goes: never trust user input. People coming from PHP and Java have many validation libraries available. But what about JavaScript? There are some options, but none seems more interesting than Joi.'
---

![Photo by Rayi Christian Wicaksono](header.jpeg)

As the saying goes: _never trust user input_. People coming from PHP and Java have many validation libraries available. But what about JavaScript? There are some options, but none seems more interesting than Joi.

[Joi](https://github.com/hapijs/joi) is maintained by [Hapi.js project](https://hapijs.com/). Even though hapi.js is a web framework by itself, Joi is independent and can be used in any type of node project. This is great for people using express or restify, for example.

What makes it even more interesting is that, besides user validation, it can be used to define database schemas as well. This post will introduce a quick start guide, with some usage cases and general tweaks.

## How to use it?

First things first: it has to be installed on the project. Considering an already initiated node project, the command to install it is: npm install joi. After being installed, a schema is required to use it, such as the file `rating-schema.js` below:

```js
// rating-schema.js
const Joi = require('joi')

module.exports = Joi.object().keys({
  username: Joi.string(),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .default(5),
  email: Joi.string()
    .email()
    .required()
})
```

This defines a model where an username, a rating (from 1 to 5) and an email (which is a required field) are expected. This is a simple example, but there are way more validation options, which can be found on the [API reference](https://github.com/hapijs/joi/blob/v10.6.0/API.md). To use the defined schema, consider a file called `rating-test.js`:

```js
// rating-test.js

const schema = require('./rating-schema')

const result = schema.validate({
  username: 'brunoluiz',
  rating: 5,
  email: 'contact@brunoluiz.net'
})
console.log(result) // result.error will be null

// result.error will show an error due to missing e-mail
const resultWithError = schema.validate({
  username: 'brunoluiz',
  rating: 5
})
console.log(resultWithError) // result.error will have an error message
```

[More about Joi errors](https://github.com/hapijs/joi/blob/v10.6.0/API.md#errors)

## Real project usage

### Validation middleware

In a real project, Joi can be used on a middleware layer. On [`express`](http://expressjs.com), for example, this can be done using:

```js
// ratings-validor.js

module.exports = (req, res, next) => {
  const ratings = Ratings.schema.validate(req.body)
  if (ratings.error) {
    return next(ratings.error)
  }
  req.parsed = ratings.value
  return next()
}
```

```js
// ....
// routes.js

app.post('/ratings', ratingsValidator, ratingsCreateController)
```

In this case, if the `ratingsValidator` returns an error due to validation, express will stop the request before even reaching the controller.

### Database schema (MongoDB and DynamoDB)

Some tools can use it to define their database schema (keep in mind that Joi is not an ORM). For MongoDB, `mongoose` can be used together with [`joigoose`](https://github.com/yoitsro/joigoose), which easily converts a Joi schema. For example:

```js
// rating.js
const mongoose = require('mongoose')
const joigoose = require('joigoose')(mongoose)

// Require the 'ratings' schema
const schema = require('./rating-schema')

// Convert joi to mongoose schema
const mongooseSchema = joigoose.convert(schema)

// Modify some fields with database specific instructions
mongooseSchema.email.unique = true

// Add fields which don't make sense on the schema validator
mongooseSchema.updatedAt = { type: Date, default: Date.now }
mongooseSchema.createdAt = { type: Date, default: Date.now }

// Define mongoose model
const Ratings = mongoose.model('Ratings', mongooseSchema)

module.exports = Ratings
```

Through [`vogels`](https://github.com/ryanfitz/vogels), the same can be done in projects using DynamoDB. By default, it accepts Joi as its schema definition. The following example is based on `vogels` documentation:

```js
// blog-post-schema.js

module.exports = {
  email: Joi.string().email(),
  title: Joi.string(),
  content: Joi.binary(),
  tags: vogels.types.stringSet()
}
```

```js
// blog-post.js
const schema = require('./blog-post-schema.js')

module.exports = vogels.define('BlogPost', {
  hashKey: 'email',
  rangeKey: ‘title’,
  schema
})
```

### Exchangeability for front-end validation

Some developers prefer to define the schema once and then use everywhere, including on browsers. Today [Joi doesn't support browser usage](https://github.com/hapijs/joi/#browsers), but a package called [`joi-browser` does this job](https://github.com/jeffbski/joi-browser), enabling the usage of exactly the same schema on the front-end as well.

## Useful tweaks

![Photo by chuttersnap on Unsplash](tweaking.jpeg)

### #1 Disable Joi number() convert

By default, Joi allows users to pass numbers formatted as strings, in cases of number() fields. This is specially bad if the validate() result is only used to check if there was an error, but not for it's value field. To solve this, there are two possible solutions

1. On `schema.validate(value)`, an extra parameter can be passed to disable it, as: `schema.validate(value, { convert: false })`

1. Put a `strict()` at the end of the desired number field, as: `Joi.number().strict()`

Both of them are quite annoying, because either all fields or all function calls require a specific config. One way to solve this is by extending Joi…

### #2 Extend Joi defaults

In cases such as the above, or for new field types, or even when the behavior of a default field has to be changed, `Joi.extend()` can be an option.

```js
// joi.js

const Joi = require('joi')

const ukzip = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} ?[0-9][A-Z]{2}$/i

module.exports = Joi.extend(
  {
    name: 'number',
    base: Joi.number().strict()
  },
  {
    name: 'zipcode',
    base: Joi.regex(ukzip).description('UK Zipcode')
  }
)
```

When using Joi through this file, all number fields will be on the strict mode — which solves the issue of applying tweak #1 everywhere — and a `zipcode()` validator is created, based on a pre-defined regex.

More rules can be added and, actually, the Joi API enables [much more customisation](https://github.com/hapijs/joi/blob/v10.6.0/API.md#extendextension) on `Joi.extend`.

### #3 Create default fields

In some projects, a lot of models will have some default fields, such as an `extensionAttributes`, where custom vendor data will be put into (as Magento already does) or `updatedAt`. In these cases, the `Joi.object` can be extended to include default fields:

```js
// joi.js

const Joi = require('joi')

module.exports = Joi.extend({
  name: 'object',
  base: Joi.object().keys({
    extensionAttributes: Joi.object(),
    updatedAt: Joi.date().default(Date.now)
  })
})
```

### #4 Show all validation errors

Usually Joi validation dies on the first error, returning on it's message which field failed. This is an issue when an input have many fields with problems. The user will have to do many requests to discover all problematic fields. To fix this issue, the following option can be added on the function call:

`const result = schema.validate(value, { abortEarly: false })`

With this config, if an error occurs, the `result.error` will return all validation failures.

### #5 Built-in Joi conditional validations

If a field depends on values from another field, the conditional when() can be used.

```js
// joi-from-doc.js

const Joi = require('joi')

const schema = Joi.object().keys({
  a: Joi.any()
    .valid('x')
    .when('b', {
      is: 5,
      then: Joi.valid('y'),
      otherwise: Joi.valid('z')
    }),
  b: Joi.any()
})

console.log(schema.validate({ a: 'x' }).error === null) // valid
console.log(schema.validate({ a: 'z' }).error === null) // valid
console.log(schema.validate({ a: 'z', b: 0 }).error === null) // valid
console.log(schema.validate({ a: 'y', b: 0 }).error !== null) // invalid
console.log(schema.validate({ a: 'y', b: 5 }).error === null) // valid
```

In this case, the field `a` accepts the values `x, y, z`. But, to accept `y` as a value, the field b have to be equals 5, otherwise only `x` and `z` will be accepted.

Of course, this is a simple and fictitious conditional validation, but it is quite useful in cases where some field requires a specific validator when some other had a specific input.

## Are you ready to use it?

I hope this post convinced you to use some validation tool such as Joi, instead of validating everything by hand (or not validating at all). But, if you are using it already: do you know any other cool trick or tweak? Let me know in the comments section below.

## References

- Joi repo: [https://github.com/hapijs/joi](https://github.com/hapijs/joi)

- Joi API Reference: [https://github.com/hapijs/joi/blob/v10.6.0/API.md](https://github.com/hapijs/joi/blob/v10.6.0/API.md)

- Joigoose repo: [https://github.com/yoitsro/joigoose](https://github.com/yoitsro/joigoose)

- Joi-browser repo: [https://github.com/jeffbski/joi-browser](https://github.com/jeffbski/joi-browser)

- Mongoose website: [http://mongoosejs.com](http://mongoosejs.com)

- Vogels repo: [https://github.com/ryanfitz/vogels](https://github.com/ryanfitz/vogels)
