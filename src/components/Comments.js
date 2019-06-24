import React from 'react'
import Disqus from 'gatsby-plugin-disqus'

export default ({ id, title, url }) => (
  <Disqus identifier={id} title={title} url={url} />
)
