const {
  validateMssqlWinData,
  sourceDataPattern,
  validateMssqlHostData,
  validatePgsqlData,
  validateDirectory,
  validateType,
} = require('../Models/Sources/SourcesDataValidate')
const {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
  directoryBackup,
} = require('../Models/Sources/SourcesExecution')
const {
  getAllDocuments,
  DB_SOURCE,
  createDocument,
  deleteDocument,
  updateDocument,
  generateHash,
} = require('../utils/PouchDbTools')
const { validateAll } = require('../utils/Validate')
const { backupStart, backupStop } = require('./SourceBackupApi')
const { setEv } = require('../Models/Tasks/Ev')
const { getTasksStatus } = require('../Models/Tasks/TasksModel')

// Get Lists of Sources // ev, data
const getSources = async (ev) => {
  try {
    const data = await getAllDocuments(DB_SOURCE)

    // Set Default EV
    setEv(ev)

    // Sending test message
    const tasks = getTasksStatus()

    return { error: 0, message: 'List of Sources', data: data, tasks: tasks }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

// Add a new Source
const addSource = async (ev, data) => {
  const hash = generateHash()
  const nData = { ...sourceDataPattern, ...data, _id: hash }

  try {
    // Check if database and _id already exists
    const exData = await getAllDocuments(DB_SOURCE)
    const ex = exData.find((x) => x.databaseOrPath === nData.databaseOrPath || x._id === hash)
    if (ex) {
      return { error: 1, message: 'Database already exists', data: [] }
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
      await directoryBackup(nData), // Validate Directory Backup
    ]

    // Data Validation
    const validate = validateAll(validationPerms)
    if (validate.error === 1) {
      return validate
    }

    const result = await createDocument(DB_SOURCE, nData)
    return { error: 0, message: 'Source added', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err, data: [] }
  }
}

// Update a Source
const updateSource = async (ev, data) => {
  const nData = { ...sourceDataPattern, ...data }

  try {
    // Check if database already exists
    const exData = await getAllDocuments(DB_SOURCE)
    const exDbName = exData.find((x) => x.databaseOrPath === data.databaseOrPath)
    if (exDbName) {
      return { error: 1, message: 'Source already exists', data: [] }
    }

    // Check if _id not exists
    const exId = exData.find((x) => x._id === data._id)
    if (!exId) {
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
      await directoryBackup(nData), // Validate Directory Backup
    ]

    // Data Validation
    const validate = validateAll(validationPerms)
    if (validate.error === 1) {
      return validate
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    return { error: 0, message: 'Source updated', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Source', data: [] }
  }
}

const deleteSource = async (ev, data) => {
  try {
    // Check if database and _id already exists
    const exData = await getAllDocuments(DB_SOURCE)

    // Check if _id not exists
    const exId = exData.find((x) => x._id === data._id)
    if (!exId) {
      return { error: 1, message: 'Source not exists', data: [] }
    }

    const result = await deleteDocument(DB_SOURCE, data._id)

    return { error: 0, message: 'Source deleted', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on deleting Source', data: [] }
  }
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
  backupStart,
  backupStop,
}
