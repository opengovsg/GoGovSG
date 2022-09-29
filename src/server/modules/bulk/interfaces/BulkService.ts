export type CSVSchema = {
  rows: number
  isValid: boolean
}

export interface BulkService {
  parseCsv(dataString: string): CSVSchema
}
