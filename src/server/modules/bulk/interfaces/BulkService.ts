import { UploadedFile } from 'express-fileupload'
import { BulkUrlMapping } from '../../../repositories/types'

export type CSVSchema = {
  rows: number
  isValid: boolean
  longUrls: string[]
}

export interface BulkService {
  parseCsv(file: UploadedFile): CSVSchema

  generateUrlMappings(longUrls: string[]): Promise<BulkUrlMapping[]>
}
