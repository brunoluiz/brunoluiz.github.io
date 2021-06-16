---
title: 'The forgotten art of HTML redirects, without either HTTP 301 or JavaScript'
date: '2021-06-17T12:00:00Z'
description: "One of the first things API developers learn is HTTP codes. From these 3xx are special, as they redirect users from A to B. But what if I told you there is a way to do it without HTTP codes?"
aliases:
  - /2021/jun/redirect-users-without-http-301-or-js/
---

![Photo by Javier Allegue Barros on Unsplash](cover.jpg)

One of the first things API developers learn is HTTP codes. Usually, people already saw some 404 around, but soon they learn about the uses of 2xx, 4xx and 5xx codes. Probably you, insidious reader, realised I jumped the 3xx series.

Most first time developers never hear about 3xx, but probably because most haven't gone through some scenario requiring it. There are many codes in this series, but the code of interest here is HTTP 301. If a developer wants to redirect users, returning 301 will indicate to the client that the resource was moved permanently to a new address (specified in the response).

HTTP 301 can be useful in many cases:

-   Redirect URLs if there was a major URL change in a website (xyz.com/blog/2020/01/some-title to xyz.com/some-title).
-   Create redirect flows for auth (OAuth; redirect on user log-out).
-   Shorten URLs (redirect xyz.com/foo to foo.com).

These can only be returned by HTTP servers. But, there are times you might not want to maintain an HTTP server. You might have a static generated website, where you want to redirect old URLs to new URLs (due to SEO), or just have shortened URLs together with your static website.

Instead of setting up and maintaining an HTTP server, or relying on some third party to set up the redirects for your static site (example: Netlify or Vercel redirect configs), you can use static (HTML) files instead.

One could use JavaScript to set `window.location=https://foo.bar`, but this might not work as some people are browsing with JavaScript disabled nowadays. The real answer lies on `<meta http-equiv="refresh" />`.

It works as an HTTP redirect code, but it is done completely on the client-side. This feature was introduced back [in Netscape 1.1, back in 1995][1] and [there is a bit more explanation on the W3C website][2]. It is still recommended to use HTTP redirects instead of this, but static websites might not have this choice sometimes (content hosted on Github Pages, for example).

To try it out, create an HTML file with the following code and then open it in the browser. The browser should load the file and redirect straight to the target URL.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Bruno L. Silva - Twitter</title>
    <meta http-equiv="refresh" content="0; url=https://twitter.com/brunoluiz" />
  </head>
</html>
```

As promised, this is plain HTML. But, creating files like this can get a bit annoying. Besides, if you host this file in Github Pages and share the link around, the metadata of the target URL will not be present (example: `<title>`, [OpenGraph][2] and [Twitter Card][3] meta tags). This means Facebook, Twitter, messengers and others will not render a card with the target details, as in the images below.

![](./meta-example.png)

To avoid the manual work of copying metadata around and setting these files manually, I've created a tool called [URLZap][4]. Based on a YAML config, it creates HTML files with all the required metadata and the redirect HTML meta tag. There are details on how to use it, both through CLI or Github Actions, [on the project's page][5].

The YAML configuration and output files will looks like the snippets below.

```yaml
# Example configuration file to be used with: urlzap generate --config ./config.yaml
path: './output'
urls:
  github: https://github.com
```

```html
<!-- Example output at ./output/github/index.html -->
<!DOCTYPE html>
<html>
	<head>
		<title>GitHub: Where the world builds software · GitHub</title>
		<link rel="canonical" href="https://github.com"/>
		<meta name="robots" content="noindex">
		<meta charset="utf-8" />
		<meta http-equiv="refresh" content="0; url=https://github.com" />
		<meta name="description" content="GitHub is where over 65 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and features, power your CI/CD and DevOps workflows, and secure code before you commit it."/>
		<meta property="fb:app_id" content="1401488693436528"/>
		<meta name="twitter:image:src" content="https://github.githubassets.com/images/modules/site/social-cards/github-social.png"/>
		<meta name="twitter:site" content="@github"/>
		<meta name="twitter:card" content="summary_large_image"/>
		<meta name="twitter:title" content="GitHub: Where the world builds software"/>
		<meta name="twitter:description" content="GitHub is where over 65 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and feat..."/>
		<meta property="og:image" content="https://github.githubassets.com/images/modules/site/social-cards/github-social.png"/>
		<meta property="og:image:alt" content="GitHub is where over 65 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and feat..."/>
		<meta property="og:site_name" content="GitHub"/>
		<meta property="og:type" content="object"/>
		<meta property="og:title" content="GitHub: Where the world builds software"/>
		<meta property="og:url" content="https://github.com/"/>
		<meta property="og:description" content="GitHub is where over 65 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and feat..."/>
		<meta property="og:image:type" content="image/png"/>
		<meta property="og:image:width" content="1200"/>
		<meta property="og:image:height" content="620"/>
	</head>
</html>
```

As mentioned on the W3C page, it is recommended that developers use HTTP 301 instead of this strategy. But there are some valid use cases in which you might end up using this strategy. With or without URLZap, anyone hosting websites statically should be able to have redirects without having to maintain or pay a web server. It can be hosted virtually anywhere, and all browsers support it.

And well, it is always interesting to find different ways to do things we take for granted 🙃

[1]: https://www.w3.org/TR/WCAG20-TECHS/H76.html
[2]: https://ogp.me/
[3]: https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started
[4]: https://github.com/brunoluiz/urlzap
[5]: https://github.com/brunoluiz/urlzap
