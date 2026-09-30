import fs from 'fs'

// remove existing directory before creating new directory
async function fsMkdirOverwriteSync(dirPath, overwrite = true) {
  if (overwrite) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
    } catch {
      console.log(`no folder found or unable to remove ${dirPath}`)
    }
  }
  fs.mkdirSync(dirPath, { recursive: true })
}

// remove directory recurisvely
async function fsRmdirRecursiveSync(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true })
  } catch {
    console.log(`unable to remove ${dirPath}`)
  }
}

export { fsMkdirOverwriteSync, fsRmdirRecursiveSync }
