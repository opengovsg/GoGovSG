export type JsonMessage = {
  message: string
  type?: MessageType
}

export enum MessageType {
  ShortUrlError = 'ShortUrlError',
  LongUrlError = 'LongUrlError',
  FileUploadError = 'FileUploadError',
}
