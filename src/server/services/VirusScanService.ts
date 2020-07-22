import fetch from 'cross-fetch'
import CrossFormData from 'form-data'

import { injectable } from 'inversify'
import { logger, virusTotalKey } from '../config'
import { VirusScanServiceInterface } from './interfaces/VirusScanServiceInterface'

const VIRUS_TOTAL_ENDPOINT = 'https://www.virustotal.com/api/v3'

@injectable()
export class VirusScanService implements VirusScanServiceInterface {
  private static async checkResponseThenJSON(response: Response): Promise<any> {
    const result = await response.json()
    if (!response.ok) {
      const message = `Unable to scan file - ${result.error.code}: ${result.error.message}`
      logger.error(message)
      throw new Error(message)
    }
    return result
  }

  public hasVirus: (file: {
    data: Buffer
    name: string
  }) => Promise<boolean> = async (file) => {
    if (!virusTotalKey) {
      logger.warn(
        `No API key provided for VirusTotal, not scanning file ${file.name}`,
      )
      return false
    }

    // TODO: rate-limiting
    const formData = new CrossFormData()
    formData.append('file', file.data, file.name)
    const uploadResponse = await fetch(`${VIRUS_TOTAL_ENDPOINT}/files`, {
      method: 'POST',
      headers: {
        'x-apikey': virusTotalKey,
      },
      body: (formData as unknown) as FormData,
    })
    const uploadResult = await VirusScanService.checkResponseThenJSON(
      uploadResponse,
    )

    const analysisResponse = await fetch(
      `${VIRUS_TOTAL_ENDPOINT}/analyses/${uploadResult.data.id}`,
      {
        method: 'GET',
        headers: { 'x-apikey': virusTotalKey },
      },
    )
    const {
      meta: {
        file_info: { sha256 },
      },
    } = await VirusScanService.checkResponseThenJSON(analysisResponse)

    const fileResponse = await fetch(
      `${VIRUS_TOTAL_ENDPOINT}/files/${sha256}`,
      {
        method: 'GET',
        headers: { 'x-apikey': virusTotalKey },
      },
    )
    const {
      data: {
        attributes: { last_analysis_stats: stats },
      },
    } = await VirusScanService.checkResponseThenJSON(fileResponse)

    return stats.malicious > 0 || stats.suspicious > 0
  }
}

export default VirusScanService
