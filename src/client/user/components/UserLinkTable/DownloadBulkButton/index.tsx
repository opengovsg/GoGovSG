import React from 'react'

import * as Sentry from '@sentry/react'
import { GAEvent } from '../../../../app/util/ga'
import { DropdownButton, DropdownOption } from '../../../widgets/DropdownButton'

type DownloadFormats = 'csv' | 'png' | 'svg'

type DownloadPathMap = { [format in DownloadFormats]: string }

const downloadPaths: DownloadPathMap = {
  csv: 'generated.csv',
  png: 'generated_png.zip',
  svg: 'generated_svg.zip',
}

function downloadFileFromS3(format: DownloadFormats, bulkCsvIds: string[]) {
  bulkCsvIds.forEach((bulkCsvId) => {
    try {
      window.open(`${bulkCsvId}/${downloadPaths[format]}`)
      GAEvent(`qr code bulk download`, format, 'successful')
    } catch (e) {
      Sentry.captureMessage(`qr code bulk download for ${format} unsuccessful`)
      GAEvent('qr code bulk download', format, 'unsuccesful')
    }
  })
}

const DownloadBulkButton = ({ bulkCsvIds }: { bulkCsvIds: string[] }) => {
  const options: DropdownOption[] = [
    {
      name: 'Download all',
      onClick: () => {
        downloadFileFromS3('csv', bulkCsvIds)
        downloadFileFromS3('png', bulkCsvIds)
        downloadFileFromS3('svg', bulkCsvIds)
      },
    },
    {
      name: 'Links (CSV File)',
      onClick: () => downloadFileFromS3('csv', bulkCsvIds),
    },
    {
      name: 'QR Codes (PNG)',
      onClick: () => downloadFileFromS3('png', bulkCsvIds),
    },
    {
      name: 'QR Codes (SVG)',
      onClick: () => downloadFileFromS3('svg', bulkCsvIds),
    },
  ]

  return (
    <DropdownButton buttonText="Download .zip" options={options} fullWidth />
  )
}

export default DownloadBulkButton
