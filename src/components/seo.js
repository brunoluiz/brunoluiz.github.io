import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

function SEO ({
  description,
  lang,
  meta,
  keywords,
  title,
  pathname,
  thumbnail,
  type
}) {
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description
        return (
          <Helmet
            htmlAttributes={{
              lang
            }}
            title={title}
            titleTemplate={`${data.site.siteMetadata.title} | %s`}
            meta={[
              {
                name: `description`,
                content: metaDescription
              },
              {
                property: `og:url`,
                content: `${data.site.siteMetadata.siteUrl}${pathname}`
              },
              {
                property: `og:title`,
                content: title
              },
              {
                property: `og:image`,
                content: `${data.site.siteMetadata.siteUrl}${thumbnail}`
              },
              {
                property: `og:description`,
                content: metaDescription
              },
              {
                property: `og:type`,
                content: type
              },
              {
                name: `twitter:card`,
                content: `summary`
              },
              {
                name: `twitter:creator`,
                content: data.site.siteMetadata.author
              },
              {
                name: `twitter:title`,
                content: title
              },
              {
                name: `twitter:description`,
                content: metaDescription
              },
              {
                name: 'google-site-verification',
                content: '2za6GvvisJHVED9GglWd8xO4jWCp4GPpAKYBDM4ttx8'
              }
            ]
              .concat(
                keywords.length > 0
                  ? {
                    name: `keywords`,
                    content: keywords.join(`, `)
                  }
                  : []
              )
              .concat(meta)}
          />
        )
      }}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  keywords: [],
  pathname: undefined,
  thumbnail: undefined,
  type: 'site'
}

SEO.propTypes = {
  description: PropTypes.string,
  pathname: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.array,
  keywords: PropTypes.arrayOf(PropTypes.string),
  thumbnail: PropTypes.string,
  type: PropTypes.string,
  title: PropTypes.string.isRequired
}

export default SEO

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
        siteUrl
      }
    }
  }
`
