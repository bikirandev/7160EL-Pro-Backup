var { Storage } = require('@google-cloud/storage')
var path = require('path')
var fs = require('fs')
var progress = require('progress-stream')
const isoToUnix = require('../../utils/isoToUnix')
const { getAllDocuments, DB_SOURCE } = require('../../utils/PouchDbTools')
// const { app } = require('electron')

const backupToBucket = async (filePath, destConfig, remoteDir = 'backup', gzip = false) => {
  const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
  const destination = `${remoteDir}/${fileName}`

  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
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

    return { error: 0, message: 'Backup successful', data: null }
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
      credentials: destConfig.credentials,
    })

    // Add metadata to the file.
    const metadata = {
      metadata: {
        sourceId,
        destinationId: destConfig._id,
      },
    }

    const status = await storage.bucket(destConfig.bucket).upload(filePath, {
      gzip,
      destination,
      metadata,
    })

    return { error: 0, message: 'Backup successful', data: status }
  } catch (err) {
    throw new Error(err)
  }
}

const getFiles = async (destConfig, remoteDir = '') => {
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Find by metadata sourceId
    const [files] = await storage.bucket(destConfig.bucket).getFiles({
      prefix: remoteDir,
    })

    // Get all sources from the database
    const databaseSources = await getAllDocuments(DB_SOURCE)
    const nFiles = files
      .map((file) => {
        return {
          _id: file.id,
          name: file.name,
          timeCreated: isoToUnix(file.metadata.timeCreated),
          timeUpdated: isoToUnix(file.metadata.updated),
          size: file.metadata.size,
          sourceId: file.metadata.metadata.sourceId,
          destinationId: file.metadata.metadata.destinationId,
        }
      })
      .filter((file) => {
        // Filter files based on available sources in the database
        //database sources is an array of all sources in the database
        return databaseSources.find((source) => source._id === file.sourceId)
      })

    return { error: 0, message: 'List of Backups', data: nFiles }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadFile = async (destConfig, fileId, localPath) => {
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Download file
    const file = storage.bucket(destConfig.bucket).file(fileId)
    await file.download({ destination: localPath })

    return { error: 0, message: 'Download successful', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

const removeFiles = async (destConfig, fileId) => {
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Delete file
    const file = storage.bucket(destConfig.bucket).file(fileId)
    await file.delete()

    return { error: 0, message: 'Backup deleted', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

const removeMultipleFiles = async (destConfig, fileIds) => {
  try {
    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    const files = fileIds.map((fileId) => {
      return storage.bucket(destConfig.bucket).file(fileId)
    })

    await storage.bucket(destConfig.bucket).deleteFiles({
      files,
    })

    return { error: 0, message: 'Backups deleted', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  backupToBucket,
  backupToBucket2,
  getFiles,
  downloadFile,
  removeFiles,
  removeMultipleFiles,
}
