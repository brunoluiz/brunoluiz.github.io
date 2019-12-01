import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/Seo'

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        icon
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(pruneLength: 180)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            summary
          }
        }
      }
    }
  }
`

const Index = ({ data, location }) => {
  const { title: siteTitle, icon } = data.site.siteMetadata
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={'All posts'}
        pathname={location.pathname}
        keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        thumbnail={icon}
      />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        const summary = node.frontmatter.summary || node.excerpt
        return (
          <div key={node.fields.slug}>
            <h3>
              <Link to={node.fields.slug}>{title}</Link>
            </h3>
            <small>{node.frontmatter.date}</small>
            <p dangerouslySetInnerHTML={{ __html: summary }} />
          </div>
        )
      })}
    </Layout>
  )
}

export default Index
