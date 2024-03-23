const crypto = require('crypto')
const {
  getAllDocuments,
  DB_SOURCE,
  createDocument,
  deleteDocument,
  updateDocument,
} = require('../utils/PouchDbTools')
// eslint-disable-next-line no-unused-vars
//const { validateMssqlWin } = require('../Models/Sources/SourcesValidate')

// ## Note
// type: 'mssql-win', 'mssql-host', 'directory'
// data = {id: '', type: '', databaseOrPath: '', host: '', user: '', password: '', directory: ''  }

// Get Lists of Sources // ev, data
const getSources = async () => {
  try {
    const data = await getAllDocuments(DB_SOURCE)
    console.log('Data:', data)

    return { error: 0, message: 'List of Sources', data: data }
  } catch (e) {
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

// Add a new Source
const addSource = async (ev, data) => {
  try {
    const hash = crypto.createHash('md5').update(data.database).digest('hex')

    const nData = {
      _id: hash,
      type: data.type,
      databaseOrPath: data.database,
      host: data.host,
      user: data.user,
      password: data.password,
      directory: data.directory,
    }

    const result = await createDocument(DB_SOURCE, nData)
    return { error: 0, message: 'Source added', data: result }
  } catch (e) {
    return { error: 1, message: 'Error on adding Source', data: [] }
  }
}

// Update a Source
const updateSource = async (ev, data) => {
  console.log('S Data:', data)
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
  try {
    const result = await deleteDocument(DB_SOURCE, data.id)

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
