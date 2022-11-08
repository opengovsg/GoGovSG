const fs = require('fs')

// remove existing directory before creating new directory
async function fsMkdirOverwriteSync(dirPath, overwrite = true) {
  if (overwrite) {
    try {
      fs.rmdirSync(dirPath, { recursive: true, force: true })
    } catch (e) {
      console.log(`no folder found or unable to remove ${dirPath}`)
    }
  }
  fs.mkdirSync(dirPath, { recursive: true })
}

// remove directory recurisvely
async function fsRmdirRecursiveSync(dirPath) {
  try {
    fs.rmdirSync(dirPath, { recursive: true, force: true })
  } catch (e) {
    console.log(`unable to remove ${dirPath}`)
  }
}

module.exports.fsMkdirOverwriteSync = fsMkdirOverwriteSync
module.exports.fsRmdirRecursiveSync = fsRmdirRecursiveSync
