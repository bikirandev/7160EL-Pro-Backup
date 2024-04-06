const { getDestination } = require('../Models/Destinations/DestinationModel')
const { DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const fs = require('fs')
const path = require('path')
const cornParser = require('cron-parser')
const { addTask, removeTask, restartTask } = require('../Models/Tasks/TasksModel')
const { getFiles, downloadFile } = require('../Models/GoogleBackup/GoogleBackup')

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
    const dataSt = await getDocument(DB_SOURCE, data._id)
    if (dataSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const exData = dataSt.data

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
    const dataSt = await getDocument(DB_SOURCE, data._id)
    if (dataSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const exData = dataSt.data

    const result = await updateDocument(DB_SOURCE, data._id, {
      ...exData,
      frequency: data.frequency,
      frequencyPattern: data.frequencyPattern,
      backupQuantity: data.backupQuantity,
      backupRetention: data.backupRetention,
    })

    // Remove Source from Task
    removeTask(exData)

    // Collect and add the backup source
    const sourceSt = await getDocument(DB_SOURCE, data._id)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not found', data: null }
    }
    const sourceInfo = sourceSt.data

    // Adding the task
    addTask(sourceInfo)

    // Restart Task
    restartTask()

    return { error: 0, message: 'Frequency updated successfully', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating frequency', data: null }
  }
}

// get recent backups
const getRecentBackups = async (ev, data) => {
  try {
    const filesSt = await getFiles(data)
    if (filesSt.error) {
      return filesSt
    }

    console.log(filesSt.data)

    return { error: 0, message: 'List of Backups', data: filesSt.data }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadBackup = async (ev, data) => {
  // data
  // data.sourceId = ''
  // data.backupId = ''
  // data.downloadPath = ''

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
    const sourceSt = await getDocument(DB_SOURCE, data.sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    // Collect destination configuration
    const destConfig = await getDestination(sourceData.destinationId)
    if (destConfig.title === '') {
      return { error: 1, message: 'Destination config not found', data: null }
    }

    // Download path
    const backupId = data.backupId.split('%2F').join('/')
    const filename = path.basename(backupId)
    const localPath = path.join(data.downloadPath, filename)

    // Download
    const dFile = await downloadFile(destConfig, backupId, localPath)

    console.log(dFile)

    return { error: 0, message: 'File Downloaded Successfully', data: { localPath } }
  } catch (err) {
    throw new Error(err)
  }
}

const removeBackup = async (ev, data) => {
  // data.sourceId = ''
  // data.backupId = ''

  console.log(data)

  if (!data.sourceId) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  if (!data.backupId) {
    return { error: 1, message: 'Backup ID not found', data: null }
  }

  try {
    // Collect source configuration
    const sourceSt = await getDocument(DB_SOURCE, data.sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    // Collect destination configuration
    const destSt = await getDestination(sourceData.destinationId)
    if (destSt.error) {
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    // Remove Backup
    const result = await removeBackup(destConfig, data.backupId)

    return { error: 0, message: 'Backup removed successfully', data: result }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  updateAutoStart,
  updateFrequency,
  getRecentBackups,
  downloadBackup,
  removeBackup,
}
