export const MAX_CSV_UPLOAD_SIZE = 5 * 1024 * 1024 // 5 MB
export const MAX_FILE_UPLOAD_SIZE = 20 * 1024 * 1024 // 20 MB
export const LINK_DESCRIPTION_MAX_LENGTH = 200
export const BULK_UPLOAD_HEADER = 'Original links to be shortened'
export const TAG_SEPARATOR = ';'
export const MAX_NUM_TAGS_PER_LINK = 3
export const MIN_TAG_SEARCH_LENGTH = 3
export enum BULK_QR_DOWNLOAD_FORMATS {
  CSV = 'CSV',
  PNG = 'PNG',
  SVG = 'SVG',
}
type BULK_QR_DOWNLOAD_MAPPINGS_TYPE = {
  [value in keyof typeof BULK_QR_DOWNLOAD_FORMATS]: string
}

export const BULK_QR_DOWNLOAD_MAPPINGS: BULK_QR_DOWNLOAD_MAPPINGS_TYPE = {
  CSV: 'generated.csv',
  PNG: 'generated_png.zip',
  SVG: 'generated_svg.zip',
}
