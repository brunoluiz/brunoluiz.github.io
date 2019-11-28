import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'

const theme = {
  scaleRatio: 2,
  baseFontSize: '17px',
  baseLineHeight: 1.75,
  headerWeight: 500,
  bodyWeight: 400,
  boldWeight: 700,
  headerColor: 'hsla(0,0%,0%,1)',
  headerFontFamily: [
    'Merriweather',
    'Helvetica Neue',
    'Helvetica',
    'Arial',
    'sans-serif'
  ],
  bodyFontFamily: ['Lora', 'Helvetica Neue', 'sans-serif'],
  plugins: [new CodePlugin()],
  googleFonts: [
    {
      name: 'Lora',
      styles: ['400', '300', '400i', '300i', '700']
    },
    {
      name: 'Merriweather',
      styles: ['400', '700']
    }
  ],
  overrideStyles: ({ rhythm, scale }, options, styles) => ({
    h3: {
      marginBottom: rhythm(1 / 4)
    },
    'h1 > a, h2 > a, h3 > a': {
      color: 'inherit',
      textDecoration: 'none'
    },
    'h1 > a:hover, h2 > a:hover, h3 > a:hover': {
      textDecoration: 'underline'
    },
    a: {
      color: '#d65947'
    },
    'a:hover,a:active': {
      color: options.bodyColor
    },
    'h1,h2,h3,h4,h5,h6': {
      marginTop: rhythm(1.5)
    },
    blockquote: {
      ...scale(1 / 5),
      paddingLeft: rhythm(13 / 16),
      marginLeft: 0,
      borderLeft: `${rhythm(3 / 16)} solid #fca206`
    }
  })
}

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export const rhythm = typography.rhythm
export const scale = typography.scale

export default typography
