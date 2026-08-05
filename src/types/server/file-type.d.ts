declare module 'file-type' {
  export interface FileTypeResult {
    ext: string
    mime: string
  }

  export function fileTypeFromBuffer(
    buffer: Uint8Array | ArrayBuffer,
  ): Promise<FileTypeResult | undefined>
}
