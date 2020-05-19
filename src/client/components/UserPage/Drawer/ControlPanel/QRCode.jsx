import React from 'react'
import PropTypes from 'prop-types'
import qr from 'qrcode'
import FileSaver from 'file-saver'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

const XML_NS = 'http://www.w3.org/2000/xmlns/'
const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const QR_OPTIONS = { errorCorrectionLevel: 'H', margin: 1 }

export default class QRCode extends React.Component {
  constructor(props) {
    super(props)
    this.downloadSvg = this.downloadSvg.bind(this)
    this.downloadPng = this.downloadPng.bind(this)

    // Download qr code externally.
    window.QrCodeComponent = this

    // Accessing refs via callbacks.
    this.canvasRef = null
    this.svgContainerRef = null
    this.setCanvasRef = (element) => {
      this.canvasRef = element
    }
    this.setSvgContainerRef = (element) => {
      this.svgContainerRef = element
    }
  }

  componentDidMount() {
    this.update()
  }

  /* eslint-disable react/forbid-foreign-prop-types */
  shouldComponentUpdate(nextProps) {
    const self = this
    return Object.keys(QRCode.propTypes).some(
      (k) => self.props[k] !== nextProps[k],
    )
  }
  /* eslint-enable react/forbid-foreign-prop-types */

  componentDidUpdate() {
    this.update()
  }

  /* Triggers SVG download of QR code */
  downloadSvg() {
    const { value: filename } = this.props
    const blob = new Blob([this.svgContainerRef.innerHTML], {
      type: 'text/plain;charset=utf-8',
    })
    FileSaver.saveAs(blob, `${filename}.svg`)
  }

  /* Triggers PNG download of QR code */
  downloadPng() {
    const self = this
    const { value: filename } = this.props

    // Get source SVG
    const svg = this.svgContainerRef.firstChild

    // Set width and height attributes of svg,
    // required to draw image on canvas on FireFox.
    svg.setAttribute('width', svg.clientWidth)
    svg.setAttribute('height', svg.clientHeight)

    // Canvas to draw on
    const canvas = document.createElement('canvas')
    canvas.width = self.props.size
    canvas.height = self.props.size

    const ctx = canvas.getContext('2d')
    const loader = new Image(self.props.size, self.props.size)

    const svgAsXML = new XMLSerializer().serializeToString(svg)

    // Configure sizes
    // eslint-disable-next-line func-names
    loader.onload = function () {
      ctx.drawImage(loader, 0, 0, loader.width, loader.height)

      canvas.toBlob((blob) => {
        FileSaver.saveAs(blob, `${filename}.png`, 'image/png')
      })

      // Reset width and height attributes of svg,
      svg.removeAttribute('width', svg.clientWidth)
      svg.removeAttribute('height', svg.clientHeight)
    }
    loader.src = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`
  }

  update() {
    const self = this
    const svgContainer = this.svgContainerRef
    const ctx = this.canvasRef

    qr.toString(self.props.value, QR_OPTIONS, (err, svgString) => {
      if (!err) {
        // Create an HTML SVG element from a div and draw QR code on it
        const div = document.createElement('div')
        div.innerHTML = svgString
        const svg = div.firstChild

        if (svg && self.props.logo) {
          // eslint-disable-next-line no-unused-vars
          const [_posX, _posY, width, height] = svg
            .getAttribute('viewBox')
            .split(' ')

          // Embedded logo
          const logoImg = document.createElement('img')
          logoImg.src = self.props.logo

          // eslint-disable-next-line func-names
          logoImg.onload = function () {
            // Draw the logo on the canvas to get a data uri
            ctx
              .getContext('2d')
              .drawImage(logoImg, 0, 0, self.props.size, self.props.size)

            // Create the image element for logo
            const image = document.createElementNS(SVG_NS, 'image')

            // Calculate dimensions of logo relative to SVG
            const dw = Math.floor(0.35 * width)
            const dh = Math.floor(0.35 * height)
            image.setAttributeNS(null, 'width', dw)
            image.setAttributeNS(null, 'height', dh)

            // Position in centre
            image.setAttributeNS(null, 'x', Math.floor((width - dw) / 2))
            image.setAttributeNS(null, 'y', Math.floor((height - dh) / 2))

            // Insert logo from canvas
            image.setAttributeNS(
              XLINK_NS,
              'xlink:href',
              ctx.toDataURL('image/png'),
            )

            svg.setAttributeNS(XML_NS, 'xmlns:xlink', XLINK_NS)
            svg.appendChild(image)

            // Display the svg
            svgContainer.innerHTML = new XMLSerializer().serializeToString(svg)
          }
        }
      }
    })
  }

  render() {
    const self = this
    return (
      <>
        <ButtonGroup
          size="medium"
          color="primary"
          style={{ display: 'flex', justifyContent: 'center', margin: '12px' }}
          aria-label="small outlined button group"
        >
          <Button
            style={{ padding: '8px 24px 8px 32px' }}
            size="large"
            variant="contained"
            onClick={self.downloadSvg}
          >
            SVG
          </Button>
          <Button
            style={{ padding: '8px 32px 8px 24px' }}
            variant="contained"
            onClick={self.downloadPng}
          >
            PNG
          </Button>
        </ButtonGroup>
        <canvas
          style={{ height: '100%', width: '100%', display: 'none' }}
          height={self.props.size}
          width={self.props.size}
          ref={this.setCanvasRef}
        />
        <div ref={this.setSvgContainerRef} />
      </>
    )
  }
}

/* eslint-disable react/no-unused-prop-types */
QRCode.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  logo: PropTypes.string,
}
/* eslint-enable react/no-unused-prop-types */

QRCode.defaultProps = {
  size: 128,
  logo: undefined,
}
