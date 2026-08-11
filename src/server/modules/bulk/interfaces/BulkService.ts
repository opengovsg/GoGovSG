import { UploadedFile } from 'express-fileupload'
import { BulkUrlMapping } from '../../../repositories/types.js'

export interface BulkService {
  parseCsv(file: UploadedFile): Promise<string[]>

  generateUrlMappings(longUrls: string[]): Promise<BulkUrlMapping[]>
}
