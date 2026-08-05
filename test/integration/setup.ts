import { File } from 'node:buffer'

if (typeof globalThis.File === 'undefined') {
  globalThis.File = File
}
