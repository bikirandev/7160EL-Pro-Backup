const Datastore = require('nedb')
const fs = require('fs')
const { findAll, remove, create } = require('../Models/Sources/SourcesOperation')
const ApiReply = require('../ApiReply')
const dStoreSources = './Data/nedb_sources.db'
const db = new Datastore({ filename: dStoreSources, autoload: true })

// type: 'mssql-win', 'mssql-host', 'directory'
// data = {id: '', type: '', databaseOrPath: '', host: '', user: '', password: '', directory: ''  }

// Get Lists of Sources
const getSources = async (ev, data) => {
  const sources = await findAll(db, {})
  ev.reply(ApiReply.sourceListReply, sources)
}

// Add a new Source
const addSource = async (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Collect if the source already exists
  const sourceExists = await findAll(db, { databaseOrPath: data.database, type: data.type })

  // Check if the source already exists
  if (sourceExists.data.length > 0) {
    //ev.reply('message', 'Source already exists')
    ev.reply('action', { error: 1, message: 'Source already exists', data: [] })
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

  ev.reply('message', newSource.message)

  const sources = await findAll(db, {})
  ev.reply(ApiReply.sourceListReply, sources)
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
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Collect if the source already exists
  const sourceExists = await findAll(db, { databaseOrPath: data.database, type: data.type })
  console.log('sourceExists', sourceExists)

  if (sourceExists.data.length === 0) {
    return { error: 1, message: 'Source does not exist', data: [] }
  }

  const id = sourceExists.data[0]._id

  // delete the source in the database
  const deletedSource = await remove(db, id)
  console.log('deletedSource', deletedSource)

  return deletedSource
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
}
