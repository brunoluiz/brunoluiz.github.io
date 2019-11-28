import React from 'react'
import { Link, graphql } from 'gatsby'

import Comments from '../components/Comments'
import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/seo'
import { rhythm, scale } from '../utils/typography'

const getThumbnail = post =>
  post.frontmatter.cover
    ? post.frontmatter.cover.childImageSharp.fixed.src
    : null

const BlogPostTemplate = ({ location, data, pageContext }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.excerpt}
        pathname={location.pathname}
        thumbnail={getThumbnail(post)}
        type='article'
      />
      <h1>{post.frontmatter.title}</h1>
      <p
        style={{
          ...scale(-1 / 5),
          display: `block`,
          marginBottom: rhythm(1),
          marginTop: rhythm(-1)
        }}
      >
        {post.frontmatter.date}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <hr
        style={{
          marginBottom: rhythm(1)
        }}
      />
      <Bio />

      <ul
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
          marginLeft: 0
        }}
      >
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel='prev'>
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel='next'>
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
      <Comments
        url={location.href}
        title={post.frontmatter.title}
        id={post.id}
      />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 240)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        cover {
          childImageSharp {
            fixed(width: 1200) {
              width
              height
              src
              srcSet
            }
          }
        }
      }
    }
  }
`
