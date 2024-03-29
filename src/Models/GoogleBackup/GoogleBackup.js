/* eslint-disable no-undef */
var { Storage } = require('@google-cloud/storage')
var path = require('path')
var fs = require('fs')
var progress = require('progress-stream')
const { app } = require('electron')
const { createErrorLog } = require('../Logs/LogCreate')

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
    throw new Error(err)
  }
}

const backupToBucket2 = async (
  sourceId,
  filePath,
  destConfig,
  remoteDir = 'backup',
  gzip = false,
) => {
  const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
  const destination = `${remoteDir}/${fileName}`

  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      keyFilename: path.resolve(app.getAppPath(), destConfig.keyFilename),
    })

    const status = await storage.bucket(destConfig.bucket).upload(filePath, {
      gzip,
      destination,
    })

    return { error: 0, message: 'Backup successful', data: status }
  } catch (err) {
    throw new Error(err)
  }
}

const getRecentBackups = async (destConfig, remoteDir = 'backup') => {
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      keyFilename: destConfig.keyFilename,
    })

    console.log(remoteDir)
    const [files] = await storage.bucket(destConfig.bucket).getFiles()

    createErrorLog(
      files.map((file) => {
        return {
          name: file.name,
          timeCreated: file.metadata.timeCreated,
          updated: file.metadata.updated,
          size: file.metadata.size,
        }
      }),
    )

    return { error: 0, message: 'Backup successful', data: files }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  backupToBucket,
  backupToBucket2,
  getRecentBackups,
}
