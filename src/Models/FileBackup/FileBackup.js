const fs = require('fs')
const fse = require('fs-extra')
const zlib = require('zlib')

// Function to copy directory to temp folder
const copyDirToTemp = async (sourceDir) => {
  const tempDir = './temp' // Temporary directory path
  await fse.ensureDir(tempDir) // Ensure the temp directory exists
  await fse.emptyDir(tempDir) // Clear the temp directory if it exists

  // Copy the source directory to the temp directory
  await fse.copy(sourceDir, tempDir)

  return tempDir
}

const dirBackup = async (dirPath) => {
  const file = fs.createReadStream(dirPath)
  const gzip = zlib.createGzip()
  const compressedFile = `${dirPath}.gz`
  const fileStream = fs.createWriteStream(compressedFile)

  file.pipe(gzip).pipe(fileStream)

  await new Promise((resolve, reject) => {
    fileStream.on('finish', resolve)
    fileStream.on('error', reject)
  })
}

module.exports = {
  copyDirToTemp,
  dirBackup,
}
