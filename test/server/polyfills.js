/* eslint-env node */
const { Blob, File } = require('node:buffer')

if (typeof global.File === 'undefined') {
  global.File = File
}

if (typeof global.Blob === 'undefined') {
  global.Blob = Blob
}
