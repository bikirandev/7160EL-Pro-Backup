const { getDestination } = require('../Models/Destinations/DestinationModel')
const { backupToBucket2 } = require('../Models/GoogleBackup/GoogleBackup')
const { mssqlWinExec, directoryBackup } = require('../Models/Sources/SourcesExecution')
const { getAllDocuments, DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const { validateAll } = require('../utils/Validate')
const fs = require('fs')

// API for start or stop backup process
const backupAction = async (ev, data) => {
  // Check if database already exists
  const exData = await getAllDocuments(DB_SOURCE)

  // Check if _id not exists
  const exId = exData.find((x) => x._id === data._id)
  if (!exId) {
    return { error: 1, message: 'Source not exists', data: [] }
  }

  try {
    const nData = {
      _id: data._id,
      type: data.type,
      databaseOrPath: data.databaseOrPath,
      host: data.host,
      user: data.user,
      password: data.password,
      directory: data.directory,
      running: data.running,
      destination: data.destination,
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    return { error: 0, message: data.running ? 'Backup started' : 'Backup stopped', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on start backup', data: [] }
  }
}

// API for link destination to source
const linkDestination = async (ev, data) => {
  // Check if database already exists
  const exData = await getAllDocuments(DB_SOURCE)

  // Check if _id not exists
  const exId = exData.find((x) => x._id === data._id)
  if (!exId) {
    return { error: 1, message: 'Source not exists', data: [] }
  }

  try {
    const nData = {
      _id: data._id,
      type: data.type,
      databaseOrPath: data.databaseOrPath,
      host: data.host,
      user: data.user,
      password: data.password,
      directory: data.directory,
      running: data.running,
      destination: data.destination,
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    return { error: 0, message: 'Destination linked', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on linking destination', data: [] }
  }
}

// force backup
const forceBackup = async (ev, id) => {
  try {
    // Step-1: Get source configuration
    const sourceData = await getDocument(DB_SOURCE, id)
    if (!sourceData) {
      return { error: 1, message: 'Source not exists', data: [] }
    }

    console.log('Force backup:', sourceData)

    const destinationId = sourceData.destinationId
    if (!destinationId) {
      return { error: 1, message: 'Destination not linked', data: [] }
    }

    // Step-3: Collect destination configuration
    const destConfig = await getDestination(destinationId)
    if (destConfig.title === '') {
      return { error: 1, message: 'Destination config not found', data: [] }
    }

    // Step-4: Execute backup
    const backupSt = validateAll([
      await mssqlWinExec(sourceData),
      await directoryBackup(sourceData),
    ])
    if (backupSt.error === 1) {
      return backupSt
    }
    const backupPath = backupSt.data.backupPath

    // Step-5: Upload to destination
    await backupToBucket2(
      backupPath,
      destConfig,
      `${sourceData.type}/${sourceData.databaseOrPath}`,
      false,
    )

    // Step-6: Remove local file
    await fs.unlinkSync(backupPath)

    return { error: 0, message: 'Backup successful', data: {} }
  } catch (e) {
    // console.log('Error on force backup:', e)
    return { error: 1, message: 'Error on force backup', data: [] }
  }
}

module.exports = {
  backupAction,
  linkDestination,
  forceBackup,
}
