const Datastore = require('nedb')
const { findAll, remove, create } = require('../Models/Sources/SourcesDbOperation')
// eslint-disable-next-line no-unused-vars
const { validateMssqlWin } = require('../Models/Sources/SourcesValidate')
const dStoreSources = './Data/nedb_sources.db'

// type: 'mssql-win', 'mssql-host', 'directory'
// data = {id: '', type: '', databaseOrPath: '', host: '', user: '', password: '', directory: ''  }

// Get Lists of Sources // ev, data
const getSources = async () => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  const sources = await findAll(db, {})

  return sources
}

// Add a new Source
const addSource = async (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Validate
  //const validate = await validateMssqlWin(data.databaseOrPath)

  // Collect if the source already exists
  const sourceExists = await findAll(db, { databaseOrPath: data.database, type: data.type })

  // Check if the source already exists
  if (sourceExists.data.length > 0) {
    return { error: 1, message: 'Source already exists', data: [] }
  }

  // create the new source to the database if it doesn't exist (databaseOrPath and type)
  const newSource = await create(db, {
    type: data.type,
    databaseOrPath: data.database,
    host: data.host,
    user: data.user,
    password: data.password,
    directory: data.directory,
  })

  return newSource
}

// Update a Source
const updateSource = async (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Collect if the source already exists
  const sourceExists = await findAll(db, { databaseOrPath: data.database, type: data.type })
  console.log('sourceExists', sourceExists)

  if (sourceExists.data.length === 0) {
    return { error: 1, message: 'Source does not exist', data: [] }
  }

  // id of the source
  const nData = sourceExists.data[0]

  // Update the source
  const updatedSource = await db.update(db, nData._id, {
    ...nData,
    ...data,
  })
  console.log('updatedSource', updatedSource)

  return updatedSource
}

const deleteSource = async (ev, data) => {
  // Create a new instance of the database
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Collect if the source already exists
  const sourceExists = await findAll(db, { _id: data._id, type: data.type })

  // Check if the source already exists
  if (sourceExists.data.length === 0) {
    return { error: 1, message: 'Source does not exist', data: [] }
  }

  // id of the source
  const id = sourceExists.data[0]._id

  // delete the source in the database
  const deletedSource = await remove(db, id)

  return deletedSource
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
}
