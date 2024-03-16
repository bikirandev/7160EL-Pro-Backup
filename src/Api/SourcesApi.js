const Datastore = require('nedb')
const dStoreSources = './nedb_sources.db'

// type: 'mssql-win', 'mssql-host', 'directory'
// data = {id: '', type: '', databaseOrPath: '', host: '', user: '', password: '', directory: ''  }

// Get Lists of Sources
const getSources = (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // get all sources from the database
  const sources = db.find({}, (err, docs) => {
    if (err) {
      return { error: 1, message: 'Error getting sources', data: [] }
    }
    return { error: 0, message: 'getSources called', data: docs }
  })

  // close the database
  db.close()

  return sources
}

// Add a new Source
const addSource = async (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  console.log('data', data)

  // Check if the source already exists

  let sourceExists = await new Promise((resolve, reject) => {
    db.find({ databaseOrPath: data.database, type: data.type }, (err, docs) => {
      if (err) {
        resolve({ error: 1, message: 'Error adding source', data: [] })
      }

      resolve({ error: 0, message: 'addSource called', data: docs })
    })
  })

  console.log('sourceExists', sourceExists)

  if (sourceExists.data.length > 0) {
    return { error: 1, message: 'Source already exists', data: [] }
  }

  console.log('sourceExists', sourceExists)
  // add the new source to the database if it doesn't exist (databaseOrPath and type)

  const newSource = await new Promise((resolve, reject) => {
    db.insert(data, (err, newDoc) => {
      if (err) {
        resolve({ error: 1, message: 'Error adding source', data: [] })
      }
      resolve({ error: 0, message: 'addSource called', data: newDoc })
    })
  })

  console.log('newSource', newSource)

  // close the database
  // db.close()

  return newSource
}

// Update a Source
const updateSource = (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Check if the source  exists
  const sourceExists = db.find({ databaseOrPath: data.database, type: data.type }, (err, docs) => {
    if (err) {
      return { error: 1, message: 'Error adding source', data: [] }
    }

    return { error: 0, message: 'addSource called', data: docs }
  })

  if (sourceExists.data.length === 0) {
    return { error: 1, message: 'Source does not exist', data: [] }
  }

  const id = sourceExists.data[0]._id

  // update the source in the database
  const updatedSource = db.update(
    { _id: id },
    { $set: { database: data.database, type: data.type } },
    {},
    (err, numReplaced) => {
      if (err) {
        return { error: 1, message: 'Error updating source', data: [] }
      }
      return { error: 0, message: 'Sources updated successfully', data: numReplaced }
    },
  )

  // close the database
  db.close()

  return updatedSource
}

const deleteSource = (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  // Check if the source  exists
  const sourceExists = db.find({ databaseOrPath: data.database, type: data.type }, (err, docs) => {
    if (err) {
      return { error: 1, message: 'Error adding source', data: [] }
    }

    return { error: 0, message: 'addSource called', data: docs }
  })

  if (sourceExists.data.length === 0) {
    return { error: 1, message: 'Source does not exist', data: [] }
  }

  const id = sourceExists.data[0]._id

  // delete the source in the database
  const deletedSource = db.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      return { error: 1, message: 'Error deleting source', data: [] }
    }
    return { error: 0, message: 'Source deleted successfully', data: numRemoved }
  })

  // close the database
  db.close()

  return deletedSource
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
}
