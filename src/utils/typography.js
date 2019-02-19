import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'
import theme from 'typography-theme-moraga'

theme.plugins = [new CodePlugin()]
theme.headerWeight = 300
theme.overrideThemeStyles = ({ rhythm }, options) => ({})
const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
