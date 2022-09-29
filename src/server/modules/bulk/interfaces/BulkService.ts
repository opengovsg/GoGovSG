import { BulkUrlMapping } from '../../../repositories/types'

export type CSVSchema = {
  rows: number
  isValid: boolean
  longUrls: string[]
}

export interface BulkService {
  parseCsv(dataString: string): CSVSchema

  generateUrlMappings(longUrls: string[]): Promise<BulkUrlMapping[]>
}
