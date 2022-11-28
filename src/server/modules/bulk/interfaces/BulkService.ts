import { UploadedFile } from 'express-fileupload'
import { BulkUrlMapping } from '../../../repositories/types'

export interface BulkService {
  parseCsv(file: UploadedFile): Promise<string[]>

  generateUrlMappings(longUrls: string[]): Promise<BulkUrlMapping[]>
}
