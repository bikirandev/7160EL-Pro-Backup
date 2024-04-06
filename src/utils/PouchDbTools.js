const crypto = require('crypto')
const PouchDb = require('pouchdb')
const path = require('path')

// Define a function to get all documents
const getAllDocuments = (dbName) => {
  const dbPath = path.join('./Data', dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .allDocs({ include_docs: true })
    .then((result) => {
      // Extract and return documents from the result
      return result.rows.map((row) => row.doc)
    })
    .catch((err) => {
      console.error(err)
      throw err // Propagate the error
    })
}

const getDocument = (dbName, id) => {
  const dbPath = path.join('./Data', dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .get(id)
    .then((doc) => {
      return { error: 0, message: 'Success', data: doc }
    })
    .catch((err) => {
      if (err.status === 404) {
        return { error: 1, message: 'Not found on DB', data: null }
      } else {
        console.error('doc not found', err)
        throw err
      }
    })
}

// Add new Document
const createDocument = (dbName, data) => {
  const dbPath = path.join('./Data', dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .put(data)
    .then((result) => {
      return result
    })
    .catch((err) => {
      console.error(err)
      throw err
    })
}

const updateDocument = (dbName, id, data) => {
  const dbPath = path.join('./Data', dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .get(id)
    .then((doc) => {
      return localDB.put({ _id: id, _rev: doc._rev, ...data })
    })
    .then((result) => {
      return result
    })
    .catch((err) => {
      console.error(err)
      throw err
    })
}

const deleteDocument = (dbName, id) => {
  const dbPath = path.join('./Data', dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .get(id)
    .then((doc) => {
      return localDB.remove(doc)
    })
    .then((result) => {
      return result
    })
    .catch((err) => {
      console.error(err)
      throw err
    })
}

const generateHash = () => {
  const randString =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return crypto.createHash('md5').update(randString).digest('hex')
}

module.exports = {
  DB_SOURCE: 'db_sources',
  DB_DESTINATION: 'db_destinations',
  DB_UPLOADS: 'db_uploads',
  DB_CONFIG: 'db_config',
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  generateHash,
}
