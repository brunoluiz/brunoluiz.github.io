---
title: "Prettier: why and how to apply it"
date: "2019-02-19T19:44:37.121Z"
cover: header.jpeg
---

![Photo by Markus Spiske on Unsplash](header.jpeg)

In any programming language, different code quality and formatting rules emerge. In JavaScript, it is no different. Discussions around the topic exist since the beginning of it.

Many projects start without any configuration, because no one wants to dig into "what is the best code style guide I should follow". This might help devs to not get into [analysis paralysis](https://en.wikipedia.org/wiki/Analysis_paralysis) but, after sometime, the code can get quite messy. Everybody coding in its own way, using made up conventions... The situation gets bad fast.

Some code quality and formatting issues can be usually solved through linters and code formaters.

## Linting: the first step

The most popular linter in JavaScript is [`eslint`](https://eslint.org/).  Using a set of rules, editors with linting support can indicate which parts of the code are breaking determined quality rules, sometimes even auto-fixing it. From styling and formatting, to optimization and good practices, linters are pretty much complete and flexible on it's rules.

The issue is which rules to choose. Some developers use the famous [ Airbnb eslint configs](https://www.npmjs.com/package/eslint-config-airbnb), but people usually over customize it. As the following example, projects using `eslint` can have plenty of `eslint-*` packages to achieve the team settled coding style configuration. 

```js
// package.json
...
"eslint-config-airbnb-base": "^5.0.1",
"eslint-config-standard": "^5.3.5",
"eslint-plugin-filenames": "^1.1.0",
"eslint-plugin-import": "^1.12.0",
"eslint-plugin-promise": "^2.0.0",
...
```

```json
// .eslintrc.json
{
  "env": { "mocha": true },
  "parserOptions": { "sourceType": "script" },
  "extends": "airbnb-base",
  "plugins": [ "filenames" ],
  "rules": {
    "arrow-parens": [ "error", "as-needed" ],
    "comma-dangle": [ "error", "never" ],
    "filenames/match-regex": [ "error", "^[a-z0-9-.]+$" ],
    "import/no-extraneous-dependencies": [
      "error",
      { "devDependencies": true }
    ],
    "import/newline-after-import": [ "off" ],
    "indent": [ "error", 4 ],
    "max-len": [ "error", 120 ],
    "no-console": [ "error" ],
    "prefer-arrow-callback": [
      "error",
      { "allowNamedFunctions": true }
    ],
    "prefer-rest-params": [ "off" ],
    "prefer-spread": [ "off" ],
    "quote-props": [ "error", "consistent-as-needed" ],
    "space-before-function-paren": [ "error", "never" ]
  }
}
```

Nasty, isn't it?

## Enter StandardJS

StandardJS is a popular JavaScript community attempt to solve the "too many rules" issue. The team need to only add [`standard`](https://standardjs.com/) linter and it should settle discussions. It is an opionated linter, with [plenty of default rules](https://standardjs.com/#standardjs--the-rules) and [no way for customization](https://standardjs.com/#i-disagree-with-rule-x-can-you-change-it).

There are some complications around StandardJS though (personal opinion: I still like it). Calling it "standard", where it is not actually the "de facto" standard for JS projects, can confuse people (there is even a [ disclaimer in their page ](https://standardjs.com/#but-this-isnt-a-real-web-standard)). But, the biggest polemic, is the decission to not use semi-colons.

The project arguments it is unnecessary nowadays, as all JS engines can deal with it using Automatic Semicolon Insertion (ASI). The catch is that ASI doesn't work as expected in some cases, and some think it can generate performance penalties.

It is still a good option for linting. If semi-colons are preferred, [`semistandard`](https://github.com/Flet/semistandard) can be used instead.

## Prettier: a no-brainer code formatter for your code

![Prettier logo](prettier.png)

While StandardJS tries to be the no-brainer linting option, Prettier tries to do the same for code formatting.

There are some differences between linters and code formatting, enabling both to be even used together. 

