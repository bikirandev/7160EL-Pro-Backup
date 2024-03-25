var { Storage } = require('@google-cloud/storage')
var path = require('path')
var fs = require('fs')
var progress = require('progress-stream')

const backupToBucket = async (filePath, destConfig, remoteDir = 'backup', gzip = false) => {
  const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
  const destination = `${remoteDir}/${fileName}`

  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      keyFilename: destConfig.keyFilename,
    })

    var stat = fs.statSync(filePath)
    var str = progress({
      length: stat.size,
      time: 100 /* ms */,
    })

    str.on('progress', function (progressData) {
      console.log(Math.round(progressData.percentage) + '%')
    })

    const fileStream = fs.createReadStream(filePath)
    const bucketFile = storage.bucket(destConfig.bucket).file(destination)
    const writeStream = bucketFile.createWriteStream({ gzip })

    fileStream.pipe(str).pipe(writeStream)

    writeStream.on('finish', () => {
      console.log('Backup successful')
    })

    writeStream.on('error', (err) => {
      console.log('Backup failed', err)
    })

    return { error: 0, message: 'Backup successful', data: {} }
  } catch (err) {
    console.log('Backup failed', err)
    return { error: 1, message: 'Backup failed', data: {} }
  }
}

module.exports = {
  backupToBucket,
}
