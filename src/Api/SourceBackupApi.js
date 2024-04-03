const { getDestination } = require('../Models/Destinations/DestinationModel')
const { backupToBucket2 } = require('../Models/GoogleBackup/GoogleBackup')
const { DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const { validateAll } = require('../utils/Validate')
const fs = require('fs')
const path = require('path')
const isoToUnix = require('../utils/isoToUnix')
const { Storage } = require('@google-cloud/storage')
const { dirBackup } = require('../Models/BackupLocal/BackupLocalDir')
const { restartIfRunning } = require('../Models/Tasks/TasksModel')
const { mssqlWinExecBackup } = require('../Models/BackupLocal/BackupLocalMssql')
const cornParser = require('cron-parser')
const { createBackupLog, createErrorLog } = require('../Models/Logs/LogCreate')
const moment = require('moment')
const { getFileSizeHr } = require('../utils/FileOperation')

// frequency = hourly, daily
const allowedFrequency = ['hourly', 'daily']

// force backup
const forceBackup = async (ev, id) => {
  try {
    // Message & Log
    var timeStart = moment().unix()
    createBackupLog(id, 'Backup started')

    // Step-1: Get source configuration
    const sourceData = await getDocument(DB_SOURCE, id)
    if (!sourceData) {
      createBackupLog(id, 'Source not exists')
      return { error: 1, message: 'Source not exists', data: null }
    }

    const destinationId = sourceData.destinationId
    if (!destinationId) {
      createBackupLog(id, 'Destination not linked')
      return { error: 1, message: 'Destination not linked', data: null }
    }

    // Step-3: Collect destination configuration
    const destConfig = await getDestination(destinationId)
    if (destConfig.title === '') {
      createBackupLog(id, 'Destination config not found')
      return { error: 1, message: 'Destination config not found', data: null }
    }

    // Execution
    const exe1 = await mssqlWinExecBackup(sourceData)
    const exe2 = await dirBackup(sourceData)

    // Step-4: Execute backup
    const backupSt = validateAll([exe1, exe2])
    if (backupSt.error !== 0) {
      createBackupLog(id, 'Backup failed: ' + backupSt.message)
      return backupSt
    }
    if (!backupSt?.data?.backupPath) {
      createBackupLog(id, 'Backup path not found')
      return { error: 1, message: 'Backup path not found', data: null }
    }
    const backupPath = backupSt.data.backupPath // Important
    const basename = path.basename(sourceData.databaseOrPath)

    // Step-5: Upload to destination
    await backupToBucket2(id, backupPath, destConfig, `${sourceData.type}/${basename}`, false)

    // Get file size human readable
    const fileSize = fs.statSync(backupPath).size
    const fileSizeHr = getFileSizeHr(fileSize)

    // Step-6: Remove local file
    fs.unlinkSync(backupPath)

    createBackupLog(
      id,
      'Backup completed after ' +
        (moment().unix() - timeStart) +
        ' seconds, File size: ' +
        fileSizeHr +
        '\n\n',
    )
    return { error: 0, message: 'Backup successful', data: null }
  } catch (err) {
    createErrorLog(id + ' Error on force backup: ' + err)
    return { error: 1, message: 'Error on force backup', data: null }
  }
}

// update source autoStart property only
const updateAutoStart = async (ev, data) => {
  // Data
  // _id: '------------------------',
  // autostart: true,

  if (!data._id) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  try {
    // Check if database already exists
    const exData = await getDocument(DB_SOURCE, data._id)

    // Check if source not exists
    if (!exData?._id) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    const result = await updateDocument(DB_SOURCE, data._id, {
      ...exData,
      autostart: !!data.autostart,
    })

    return { error: 0, message: 'Auto start status updated', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Auto start', data: null }
  }
}

// update frequency
const updateFrequency = async (ev, data) => {
  // Data
  // _id: '------------------------',
  // frequency: 'hourly',
  // frequencyPattern: '0 49 * * * *',
  // backupQuantity: 100,
  // backupRetention: 30,

  if (!data._id) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  if (!allowedFrequency.includes(data.frequency)) {
    return { error: 1, message: 'Frequency (' + data.frequency + ') not allowed', data: null }
  }

  // Validate Pattern
  try {
    cornParser.parseExpression(data.frequencyPattern)
  } catch (err) {
    return { error: 1, message: 'Invalid frequency pattern', data: null }
  }

  if (data.backupQuantity < 10) {
    return { error: 1, message: 'Backup quantity must be greater or equal than 10', data: null }
  }

  if (data.backupRetention < 7) {
    return { error: 1, message: 'Backup retention must be greater or equal than 7', data: null }
  }

  try {
    // Check if database already exists
    const exData = await getDocument(DB_SOURCE, data._id)

    // Check if source not exists
    if (!exData?._id) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    const result = await updateDocument(DB_SOURCE, data._id, {
      ...exData,
      frequency: data.frequency,
      frequencyPattern: data.frequencyPattern,
      backupQuantity: data.backupQuantity,
      backupRetention: data.backupRetention,
    })

    // Restart Task
    restartIfRunning(data._id, forceBackup, data.frequencyPattern)

    return { error: 0, message: 'Frequency updated successfully', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Frequency', data: null }
  }
}

// get recent backups
const getRecentBackups = async (ev, data) => {
  try {
    const storage = new Storage({
      projectId: data?.projectId,
      keyFilename: data?.keyFilename,
    })

    // Find by metadata sourceId
    const [files] = await storage.bucket(data?.bucket).getFiles({
      prefix: data?.remoteDir,
    })

    const nFiles = files.map((file) => {
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

    return { error: 0, message: 'List of Backups', data: nFiles }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadBackup = async (ev, data) => {
  // data
  // data.sourceId = ''
  // data.backupId = ''
  // data.downloadPath = ''

  // Error: Error invoking remote method 'downloadBackup': Error: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined

  if (!data.sourceId) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  if (!data.backupId) {
    return { error: 1, message: 'Backup ID not found', data: null }
  }

  if (!data.downloadPath) {
    return { error: 1, message: 'Download path not found', data: null }
  }

  // Check if download path exists
  if (!fs.existsSync(data.downloadPath)) {
    return { error: 1, message: 'Download path not exists', data: null }
  }

  try {
    // Collect source configuration
    const sourceData = await getDocument(DB_SOURCE, data.sourceId)
    if (!sourceData) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    // Collect destination configuration
    const destConfig = await getDestination(sourceData.destinationId)
    if (destConfig.title === '') {
      return { error: 1, message: 'Destination config not found', data: null }
    }

    const storage = new Storage({
      projectId: destConfig?.projectId,
      keyFilename: destConfig?.keyFilename,
    })

    // Download path
    data.backupId = data.backupId.split('%2F').join('/')
    const filename = path.basename(data.backupId)
    const localPath = path.join(data.downloadPath, filename)

    // Download
    const file = storage.bucket(destConfig.bucket).file(data.backupId)
    await file.download({ destination: localPath })

    return { error: 0, message: 'File Downloaded Successfully', data: { localPath } }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  forceBackup,
  updateAutoStart,
  updateFrequency,
  getRecentBackups,
  downloadBackup,
}
