const values = require('../../../Default/DefaultValue')
var { Storage } = require('@google-cloud/storage')
var path = require('path')

const backupToBucket = async (filePath, remoteDir = 'backup', gzip = false) => {
  const fileName = path.basename(filePath)
  const destination = `${remoteDir}/${fileName}`
  try {
    const storage = new Storage({
      projectId: values.destination.projectId,
      keyFilename: values.destination.keyFilename,
    })

    const status = await storage.bucket(values.destination.bucket).upload(filePath, {
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
