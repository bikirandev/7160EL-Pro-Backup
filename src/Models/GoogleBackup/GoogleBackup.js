var { Storage } = require('@google-cloud/storage')
var path = require('path')

const backupToBucket = async (filePath, destConfig, remoteDir = 'backup', gzip = false) => {
  const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
  const destination = `${remoteDir}/${fileName}`
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      keyFilename: destConfig.keyFilename,
    })

    const status = await storage.bucket(destConfig.bucket).upload(filePath, {
      gzip,
      destination,
    })

    return { error: 0, message: 'Backup successful', data: status }
  } catch (err) {
    return { error: 1, message: 'Backup failed', data: err }
  }
}

module.exports = {
  backupToBucket,
}
