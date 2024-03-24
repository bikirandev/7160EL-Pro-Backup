const { generateFilePath } = require('../Models/Configs/ConfigModel')
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

// eslint-disable-next-line no-unused-vars
//const { validateMssqlWin } = require('../Models/Sources/SourcesValidate')

// ## Note
// type: 'mssql-win', 'mssql-host', 'directory'
// data = {id: '', type: '', databaseOrPath: '', host: '', user: '', password: '', directory: ''  }

// Get Lists of Sources // ev, data
const getSources = async () => {
  try {
    const data = await getAllDocuments(DB_SOURCE)
    //console.log('Data:', data)

    return { error: 0, message: 'List of Sources', data: data }
  } catch (e) {
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

// Add a new Source
const addSource = async (ev, data) => {
  const hash = generateHash()
  const nData = { ...sourceDataPattern, ...data }
  const backupPath = generateFilePath(nData)

  if (!backupPath) {
    return { error: 1, message: 'Error on Default Backup Path', data: [] }
  }

  // Check if database and _id already exists
  const exData = await getAllDocuments(DB_SOURCE)
  const ex = exData.find((x) => x.databaseOrPath === nData.databaseOrPath || x._id === hash)
  if (ex) {
    return { error: 1, message: 'Database already exists', data: [] }
  }

  // Data Validation
  const validate = validateAll([
    validateType(nData), // Validate Type
    validateMssqlWinData(nData), // Validate MSSQL-Win Data, if type is mssql-win
    validateMssqlHostData(nData), // Validate MSSQL-Host Data, if type is mssql-host
    validatePgsqlData(nData), // Validate PGSQL Data, if type is pgsql
    validateDirectory(nData), // Validate Directory Data, if type is directory
    await mssqlWinExec(nData, backupPath), // Validate MSSQL-Win exec Connection
    await mssqlWinConnect(nData, backupPath), // Validate MSSQL-Win connect Connection
    await mssqlWinDemo(nData, backupPath), // Validate MSSQL-Win demo Connection
  ])
  if (validate.error === 1) {
    return validate
  }

  try {
    const nData = {
      _id: hash,
      type: data.type,
      operation: data.operation,
      databaseOrPath: data.databaseOrPath,
      host: data.host,
      user: data.user,
      password: data.password,
    }

    const result = await createDocument(DB_SOURCE, nData)
    return { error: 0, message: 'Source added', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on adding Source', data: [] }
  }
}

// Update a Source
const updateSource = async (ev, data) => {
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

  try {
    const nData = {
      _id: data._id,
      type: data.type,
      databaseOrPath: data.databaseOrPath,
      host: data.host,
      user: data.user,
      password: data.password,
      directory: data.directory,
    }

    const result = await updateDocument(DB_SOURCE, data._id, nData)

    return { error: 0, message: 'Source updated', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on updating Source', data: [] }
  }
}

const deleteSource = async (ev, data) => {
  // Check if database and _id already exists
  const exData = await getAllDocuments(DB_SOURCE)

  // Check if _id not exists
  const exId = exData.find((x) => x._id === data._id)
  if (!exId) {
    return { error: 1, message: 'Source not exists', data: [] }
  }

  try {
    const result = await deleteDocument(DB_SOURCE, data._id)

    return { error: 0, message: 'Source deleted', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on deleting Source', data: [] }
  }
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
}
