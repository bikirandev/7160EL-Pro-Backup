const { getDestination } = require('../Models/Destinations/DestinationModel')
const { backupToBucket2 } = require('../Models/GoogleBackup/GoogleBackup')
const {
  sourceDataPattern,
  validateType,
  validateMssqlWinData,
  validateMssqlHostData,
  validatePgsqlData,
  validateDirectory,
} = require('../Models/Sources/SourcesDataValidate')
const {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
} = require('../Models/Sources/SourcesExecution')
const { getAllDocuments, DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const { validateAll } = require('../utils/Validate')
const fs = require('fs')
const path = require('path')
const isoToUnix = require('../utils/isoToUnix')
const { Storage } = require('@google-cloud/storage')
const { dirBackup } = require('../Models/BackupLocal/BackupLocalDir')
const { getTasksStatus, stopTask, startTask } = require('../Models/Tasks/TasksModel')

// force backup
const forceBackup = async (ev, id) => {
  try {
    // Step-1: Get source configuration
    const sourceData = await getDocument(DB_SOURCE, id)
    if (!sourceData) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    const destinationId = sourceData.destinationId
    if (!destinationId) {
      return { error: 1, message: 'Destination not linked', data: null }
    }

    // Step-3: Collect destination configuration
    const destConfig = await getDestination(destinationId)
    if (destConfig.title === '') {
      return { error: 1, message: 'Destination config not found', data: null }
    }

    // Execution
    const exe1 = await mssqlWinExec(sourceData)
    const exe2 = await dirBackup(sourceData)

    // Step-4: Execute backup
    const backupSt = validateAll([exe1, exe2])
    if (backupSt.error !== 0) {
      return backupSt
    }
    if (!backupSt?.data?.backupPath) {
      return { error: 1, message: 'Backup path not found', data: null }
    }
    const backupPath = backupSt.data.backupPath // Important
    const basename = path.basename(sourceData.databaseOrPath)

    // Step-5: Upload to destination
    await backupToBucket2(id, backupPath, destConfig, `${sourceData.type}/${basename}`, false)

    // Step-6: Remove local file
    fs.unlinkSync(backupPath)

    return { error: 0, message: 'Backup successful', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on force backup', data: [] }
  }
}

// update source autoStart property only
const updateAutoStart = async (ev, data) => {
  const nData = { ...sourceDataPattern, ...data }

  try {
    // Check if database already exists
    const exData = await getAllDocuments(DB_SOURCE)

    // Check if source not exists
    const nExtData = exData.find((x) => x._id === data._id)
    if (!nExtData) {
      return { error: 1, message: 'Source not exists', data: [] }
    }

    const validationPerms = [
      validateType(nData), // Validate Type
      validateMssqlWinData(nData), // Validate MSSQL-Win Data, if type is mssql-win
      validateMssqlHostData(nData), // Validate MSSQL-Host Data, if type is mssql-host
      validatePgsqlData(nData), // Validate PGSQL Data, if type is pgsql
      validateDirectory(nData), // Validate Directory Data, if type is directory
      await mssqlWinExec(nData), // Validate MSSQL-Win exec Connection
      await mssqlWinConnect(nData), // Validate MSSQL-Win connect Connection
      await mssqlWinDemo(nData), // Validate MSSQL-Win demo Connection
      await dirBackup(nData), // Validate Directory Backup
    ]

    // Data Validation
    const validate = validateAll(validationPerms)
    if (validate.error === 1) {
      return validate
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    return { error: 0, message: 'Auto start status updated', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Auto start', data: [] }
  }
}

// update frequency
const updateFrequency = async (ev, data) => {
  const nData = { ...sourceDataPattern, ...data }

  try {
    // Check if database already exists
    const exData = await getAllDocuments(DB_SOURCE)

    // Check if source not exists
    const nExtData = exData.find((x) => x._id === data._id)
    if (!nExtData) {
      return { error: 1, message: 'Source not exists', data: [] }
    }

    const validationPerms = [
      validateType(nData), // Validate Type
      validateMssqlWinData(nData), // Validate MSSQL-Win Data, if type is mssql-win
      validateMssqlHostData(nData), // Validate MSSQL-Host Data, if type is mssql-host
      validatePgsqlData(nData), // Validate PGSQL Data, if type is pgsql
      validateDirectory(nData), // Validate Directory Data, if type is directory
      await mssqlWinExec(nData), // Validate MSSQL-Win exec Connection
      await mssqlWinConnect(nData), // Validate MSSQL-Win connect Connection
      await mssqlWinDemo(nData), // Validate MSSQL-Win demo Connection
      await dirBackup(nData), // Validate Directory Backup
    ]

    // Data Validation
    const validate = validateAll(validationPerms)
    if (validate.error === 1) {
      return validate
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    // check task running or not. if running then stop and start again with new frequency and if not running then do nothing
    const task = getTasksStatus()

    const currentSourceTaskStatus = task.find((x) => x.id === data._id)?.running

    if (currentSourceTaskStatus) {
      stopTask(data._id)
      startTask(data._id, forceBackup, data.frequencyPattern)
    }

    return { error: 0, message: 'Frequency updated', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Frequency', data: [] }
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

module.exports = {
  forceBackup,
  updateAutoStart,
  updateFrequency,
  getRecentBackups,
}
