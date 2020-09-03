export enum MessageType {
  ShortUrlError = 'ShortUrlError',
  LongUrlError = 'LongUrlError',
  FileUploadError = 'FileUploadError',
}

export type JsonMessage = {
  message: string
  type?: MessageType
}
