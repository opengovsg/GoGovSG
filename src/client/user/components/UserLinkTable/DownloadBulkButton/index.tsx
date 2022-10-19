import React from 'react'

import * as Sentry from '@sentry/react'
import { GAEvent } from '../../../../app/util/ga'
import { DropdownButton, DropdownOption } from '../../../widgets/DropdownButton'

// TODO: add bucket path, ideally we want to store this as an env variable and import it
const BUCKET_PATH = ''

type DownloadFormats = 'csv' | 'png' | 'svg'

type DownloadPathMap = { [format in DownloadFormats]: string }

const downloadPaths: DownloadPathMap = {
  csv: 'urls.csv',
  png: 'qr_code_png.zip',
  svg: 'qr_code_svg.zip',
}

function downloadFileFromS3(
  format: DownloadFormats,
  bulkCsvId: string,
  bucketPath: string = BUCKET_PATH,
) {
  // TODO: exact functionality to be confirmed
  try {
    window.open(`${bucketPath}/${bulkCsvId}/${downloadPaths[format]}`)
    GAEvent(`qr code bulk download`, format, 'successful')
  } catch (e) {
    Sentry.captureMessage(`qr code bulk download for ${format} unsuccessful`)
    GAEvent('qr code bulk download', format, 'unsuccesful')
  }
}

export default function DownloadBulkButton() {
  const bulkCsvId = 'placeholder_id' // TODO: likely will be retrieved from Redux store
  const options: DropdownOption[] = [
    {
      name: 'Download all',
      onClick: () => {
        downloadFileFromS3('csv', bulkCsvId)
        downloadFileFromS3('png', bulkCsvId)
        downloadFileFromS3('svg', bulkCsvId)
      },
    },
    {
      name: 'Links (CSV File)',
      onClick: () => downloadFileFromS3('csv', bulkCsvId),
    },
    {
      name: 'QR Codes (PNG)',
      onClick: () => downloadFileFromS3('png', bulkCsvId),
    },
    {
      name: 'QR Codes (SVG)',
      onClick: () => downloadFileFromS3('svg', bulkCsvId),
    },
  ]

  return (
    <DropdownButton buttonText="Download .zip" options={options} fullWidth />
  )
}
