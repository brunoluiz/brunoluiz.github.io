import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'
import theme from 'typography-theme-sutro'

theme.plugins = [new CodePlugin()]

theme.overrideThemeStyles = ({ rhythm }, options) => ({
  // 'h3 a': {
  // color: '#222'
  // }
})
const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
