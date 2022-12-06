import React from 'react'
import FileSaver from 'file-saver'

import * as Sentry from '@sentry/react'
import { useDrawerState } from '../..'
import ImageFormat from '../../../../../../shared/util/image-format'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import { get } from '../../../../../app/util/requests'
import { GAEvent } from '../../../../../app/util/ga'
import {
  DropdownButton,
  DropdownOption,
} from '../../../../widgets/DropdownButton'

// Gets file extension from content-type.
function getFileExtension(format: ImageFormat) {
  switch (format) {
    case ImageFormat.SVG:
      return 'svg'
    case ImageFormat.PNG:
      return 'png'
    case ImageFormat.JPEG:
      return 'jpeg'
    default:
      throw Error('Invalid format passed to getFileExtension')
  }
}

// Downloads QR code from server.
async function downloadServerQrCode(
  shortLink: string,
  format: ImageFormat,
): Promise<void> {
  const url = `https://${document.location.host}/${shortLink}`
  const endpoint = `/api/qrcode?url=${encodeURIComponent(
    shortLink,
  )}&format=${encodeURIComponent(format)}`
  const response: Response = await get(endpoint)
  if (response.ok) {
    // Google Analytics: QR Code generation - actions are stringed by shortlink and format
    GAEvent('qr code generation', format.toString(), 'succesful')
    // Use filename from response for filename, fallbacks to endpoint.
    const fileName = response.headers.get('Filename') ?? url
    const bodyBlob = await response.blob()
    const blob = new Blob([bodyBlob], {
      type: response.headers.get('content-type') || format,
    })
    FileSaver.saveAs(blob, `${fileName}.${getFileExtension(format)}`)
  } else {
    // Sentry analytics: qr code download fail
    Sentry.captureMessage(`generate qr code for ${format} unsuccessful`)
    GAEvent('qr code generation', format.toString(), 'unsuccesful')
  }
}

export default function DownloadButton() {
  const modalState = useDrawerState()
  const shortLink = modalState.relevantShortLink!

  const options: DropdownOption[] = [
    {
      name: 'PNG',
      onClick: () => {
        downloadServerQrCode(shortLink, ImageFormat.PNG)
      },
    },
    {
      name: 'SVG',
      onClick: () => {
        downloadServerQrCode(shortLink, ImageFormat.SVG)
      },
    },
  ]

  return (
    <ConfigOption
      title="Download QR Code"
      mobile
      trailing={<DropdownButton buttonText="Download" options={options} />}
      trailingPosition={TrailingPosition.end}
    />
  )
}
