import React, { Component } from 'react'
import { iframeResizer } from 'iframe-resizer'

function getRemarkboxUrl (remarkboxKey, threadUri) {
  return `https://my.remarkbox.com/embed?rb_owner_key=${remarkboxKey}&thread_uri=${encodeURIComponent(
    threadUri
  )}`
}

class Remarkbox extends Component {
  constructor (props) {
    super(props)
    this.iframe = null
    this.onRef = iframe => {
      this.iframe = iframe
    }
  }

  componentDidMount () {
    if (!this.iframe) {
      return
    }

    const { threadFragment } = this.props

    iframeResizer(
      {
        checkOrigin: ['https://my.remarkbox.com'],
        inPageLinks: true,
        initCallback: event => {
          if (threadFragment) {
            event.iFrameResizer.moveToAnchor(threadFragment)
          }
        }
      },
      this.iframe
    )
  }

  render () {
    const { className } = this.props

    const frame = (
      <iframe
        className={className}
        frameBorder={0}
        ref={this.onRef}
        scrolling={'no'}
        src={getRemarkboxUrl(
          '1d1a74a1-469b-11e9-9d42-040140774501',
          this.props.uri
        )}
        style={{ width: '100%' }}
        tabIndex={0}
        title={'Remarkbox'}
      />
    )

    console.log(frame)

    return frame
  }
}

export default Remarkbox
