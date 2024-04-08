const { getDestination } = require('../Models/Destinations/DestinationModel')
const {
  DB_SOURCE,
  getDocument,
  updateDocument,
  getAllDocuments,
  DB_UPLOADS,
  deleteDocument,
} = require('../utils/PouchDbTools')
const fs = require('fs')
const path = require('path')
const cornParser = require('cron-parser')
const { addTask, removeTask, restartTask } = require('../Models/Tasks/TasksModel')
const { downloadFile, removeFile } = require('../Models/GoogleBackup/GoogleBackup')
const { BackupDel } = require('../Models/BackupRemote/BackupRemoteDelete')
const moment = require('moment')

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
    const uploads = await getAllDocuments(DB_UPLOADS)

    // Collect sources
    const sources = await getAllDocuments(DB_SOURCE)

    // Filter by sourceId
    const files = uploads.filter((x) => {
      if (!data.sourceId) {
        return sources.find((y) => y._id === x.sourceId)
      }

      return x.sourceId === data.sourceId
    })

    return { error: 0, message: 'List of Backups', data: files }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadBackup = async (ev, data) => {
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
    const destSt = await getDestination(sourceData.destinationId)
    if (destSt.error) {
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    const idAr = data.backupId.split('/')
    idAr.shift()
    idAr.pop()
    const id = idAr.join('/')

    // Download path
    const backupId = id
    const filename = path.basename(backupId)
    const localPath = path.join(data.downloadPath, filename)

    // Download
    const downloadSt = await downloadFile(destConfig, backupId, localPath)
    if (downloadSt.error) {
      // Remove local records
      if (downloadSt.action == 'remove-record') {
        await removeBackup(ev, { backupId: data.backupId })
      }
      return downloadSt
    }

    return { error: 0, message: 'File downloaded successfully', data: { localPath } }
  } catch (err) {
    throw new Error(err)
  }
}

const removeBackup = async (ev, data) => {
  // data.backupId = ''

  if (!data.backupId) {
    return { error: 1, message: 'Backup ID not found', data: null }
  }

  try {
    // Collect Uploads Info
    const uploadFile = await getDocument(DB_UPLOADS, data.backupId)
    if (uploadFile.error) {
      return { error: 1, message: 'Backup not exists', data: null }
    }
    const sourceId = uploadFile.data.sourceId
    const destinationId = uploadFile.data.destinationId
    const backupName = uploadFile.data.name

    // Collect source configuration
    const sourceSt = await getDocument(DB_SOURCE, sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    // Collect destination configuration
    const destSt = await getDestination(destinationId)
    if (destSt.error) {
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    // Remove Backup from remote
    const result = await removeFile(destConfig, backupName)

    // Remove from Uploads
    await deleteDocument(DB_UPLOADS, data.backupId)

    return { error: 0, message: 'Backup removed successfully', data: result }
  } catch (err) {
    throw new Error(err)
  }
}

const cleanupBackups = async (ev, data) => {
  // data.sourceId = ''

  if (!data.sourceId) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  try {
    // Collect source configuration
    const sourceSt = await getDocument(DB_SOURCE, data.sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    // Collect all uploads by sourceId
    // Filter by sourceId
    const uploads = await getAllDocuments(DB_UPLOADS)
    const files = uploads.filter((x) => x.sourceId === data.sourceId)

    // Cleaning Up Calculations
    const backupDel = new BackupDel(
      sourceData.frequency,
      sourceData.backupQuantity,
      sourceData.backupRetention,
      files,
      moment().unix(),
    )

    const uploadDelIds = backupDel.deleteSelector()
    console.log('uploadIds', files.length)
    console.log('uploadIds', uploadDelIds.length)

    for (const uploadId of uploadDelIds) {
      // Remove Backup from remote
      const destSt = await getDestination(uploadId.destinationId)
      if (destSt.error) {
        // return { error: 1, message: 'Destination config not found', data: null }
        continue
      }
      const destConfig = destSt.data

      // Remove Backup from remote
      const upNameAr = uploadId.split('/')
      upNameAr.shift()
      upNameAr.pop()
      const upId = upNameAr.join('/')

      console.log('Backup Removing: ', upId)
      const removeSt = await removeFile(destConfig, upId)
      if (removeSt.error) {
        // return removeSt
        continue
      }

      // Remove from Uploads
      await deleteDocument(DB_UPLOADS, uploadId)
      console.log('Backup Removed: ' + upId)
    }

    return { error: 0, message: 'Backups removed successfully', data: null }
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
  cleanupBackups,
}
