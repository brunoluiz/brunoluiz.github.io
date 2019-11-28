import React from 'react'
import { Link } from 'gatsby'

import { rhythm, scale } from '../utils/typography'
import SocialLinks from './SocialLinks'
import './Layout.css'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
  brandTitle: {
    ...scale(1.5),
    marginBottom: rhythm(1),
    marginTop: 0,
    color: '#000',

    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    }
  },
  brandTitleOnPost: {
    marginTop: 0,
    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    }
  },
  content: {
    marginLeft: `auto`,
    marginRight: `auto`,
    maxWidth: rhythm(24),
    padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`
  }
})

const Layout = ({ location, title, children }) => {
  const classes = useStyles()
  const rootPath = `${__PATH_PREFIX__}/`
  const header =
    location.pathname === rootPath ? (
      <h1 className={classes.brandTitle}>
        <Link to={`/`}>{title}</Link>
      </h1>
    ) : (
      <h3 className={classes.brandTitleOnPost}>
        <Link to={`/`}> {title} </Link>
      </h3>
    )

  const footer =
    location.pathname === rootPath ? (
      <footer>
        <SocialLinks />
      </footer>
    ) : (
      <></>
    )

  return (
    <div className={classes.content}>
      <header>{header}</header>
      <main>{children}</main>
      {footer}
    </div>
  )
}

export default Layout
