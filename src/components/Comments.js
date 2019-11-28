import React from 'react'
import Disqus from 'gatsby-plugin-disqus'

const Comments = ({ id, title, url }) => (
  <Disqus identifier={id} title={title} url={url} />
)

export default Comments
