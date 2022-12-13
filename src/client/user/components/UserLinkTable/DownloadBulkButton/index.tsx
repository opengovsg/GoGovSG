import React from 'react'

import * as Sentry from '@sentry/react'
import { GAEvent } from '../../../../app/util/ga'
import { DropdownButton, DropdownOption } from '../../../widgets/DropdownButton'
import {
  BULK_QR_DOWNLOAD_FORMATS,
  BULK_QR_DOWNLOAD_MAPPINGS,
} from '../../../../../shared/constants'

function downloadFileFromS3(
  format: BULK_QR_DOWNLOAD_FORMATS,
  bulkCsvIds: string[],
) {
  bulkCsvIds.forEach((bulkCsvId) => {
    try {
      window.open(
        `${bulkCsvId}/${BULK_QR_DOWNLOAD_MAPPINGS[format]}?x-source=console`,
      )
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
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.CSV, bulkCsvIds)
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.PNG, bulkCsvIds)
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.SVG, bulkCsvIds)
      },
    },
    {
      name: 'Links (CSV File)',
      onClick: () =>
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.CSV, bulkCsvIds),
    },
    {
      name: 'QR Codes (PNG)',
      onClick: () =>
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.PNG, bulkCsvIds),
    },
    {
      name: 'QR Codes (SVG)',
      onClick: () =>
        downloadFileFromS3(BULK_QR_DOWNLOAD_FORMATS.SVG, bulkCsvIds),
    },
  ]

  return (
    <DropdownButton buttonText="Download .zip" options={options} fullWidth />
  )
}

export default DownloadBulkButton
