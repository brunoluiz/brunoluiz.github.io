import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

const query = graphql`
  query BioQuery {
    site {
      siteMetadata {
        author
        social {
          email
          twitter
          github
        }
      }
    }
  }
`

const SocialLinks = () => {
  return (
    <StaticQuery
      query={query}
      render={data => {
        const { social } = data.site.siteMetadata
        const { twitter, github, email } = social
        return (
          <>
            <a href={`mailto:${email}`}>e-mail</a>
            {' • '}
            <a href={`https://twitter.com/${twitter}`}>twitter</a>
            {' • '}
            <a href={`https://github.com/${github}`}>github</a>
            {' • '}
            <a href={`${__PATH_PREFIX__}/rss.xml`}>rss</a>
          </>
        )
      }}
    />
  )
}

export default SocialLinks
