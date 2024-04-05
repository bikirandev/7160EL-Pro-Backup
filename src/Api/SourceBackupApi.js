const { getDestination } = require('../Models/Destinations/DestinationModel')
const { DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const fs = require('fs')
const path = require('path')
const isoToUnix = require('../utils/isoToUnix')
const { Storage } = require('@google-cloud/storage')
const cornParser = require('cron-parser')
const { addTask, removeTask, restartTask } = require('../Models/Tasks/TasksModel')

// frequency = hourly, daily
const allowedFrequency = ['hourly', 'daily']

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

    // Remove Source from Task
    removeTask(exData)

    // Collect and ass the backup source
    const sourceInfo = await getDocument(DB_SOURCE, data._id)
    addTask(sourceInfo)

    // Restart Task
    restartTask()

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
      credentials: data?.credentials,
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
      credentials: destConfig?.credentials,
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
  updateAutoStart,
  updateFrequency,
  getRecentBackups,
  downloadBackup,
}
