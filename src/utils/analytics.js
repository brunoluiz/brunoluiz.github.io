export default () => {
  const endpoint = 'https://goaccess.snapdiff.com/pixel'
  const path = 'u=' + encodeURIComponent(window.location.href)
  const referrer = document.referrer
    ? '&r=' + encodeURIComponent(document.referrer)
    : ''
  const time = '&t=' + new Date().getTime()

  const _pixel = new Image(1, 1)
  _pixel.src = `${endpoint}?${path}${referrer}${time}`
}
