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
      console.error('Error getting all documents:', err)
      throw err // Propagate the error
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
      console.error('Error adding document:', err)
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
      console.error('Error updating document:', err)
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
      console.error('Error deleting document:', err)
      throw err
    })
}

module.exports = {
  DB_SOURCE: 'db_sources',
  DB_DESTINATION: 'db_destinations',
  DB_CONFIG: 'db_config',
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}
