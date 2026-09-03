import { UploadedFile } from 'express-fileupload'
import { BulkUrlMapping } from '../../../repositories/types'

export type BulkCsvRow = {
  longUrl: string
  shortUrl?: string
}

export interface BulkService {
  parseCsv(file: UploadedFile): Promise<BulkCsvRow[]>

  generateUrlMappings(rows: BulkCsvRow[]): Promise<BulkUrlMapping[]>
}
