const findAll = (db, findBy) => {
  return new Promise((resolve, reject) => {
    db.find(findBy, (err, docs) => {
      // db.close()

      // Error handling
      if (err) {
        resolve({ error: 1, message: 'Error adding source', data: [] })
      }

      // Resolve
      resolve({ error: 0, message: 'List of Sources', data: docs })
    })
  })
}

const create = (db, data) => {
  return new Promise((resolve, reject) => {
    db.insert(data, (err, newDoc) => {
      // db.close()

      // Error handling
      if (err) {
        resolve({ error: 1, message: 'Error adding source', data: [] })
      }

      // Resolve
      resolve({ error: 0, message: 'Source created successfully', data: newDoc })
    })
  })
}

const update = (db, id, data) => {
  return new Promise((resolve, reject) => {
    db.update({ _id: id }, { $set: data }, {}, (err, numReplaced) => {
      // db.close()

      // Error handling
      if (err) {
        resolve({ error: 1, message: 'Error updating source', data: [] })
      }

      // Resolve
      resolve({ error: 0, message: 'Source updated successfully', data: numReplaced })
    })
  })
}

const remove = (db, id) => {
  return new Promise((resolve, reject) => {
    db.remove({ _id: id }, {}, (err, numRemoved) => {
      // db.close()

      // Error handling
      if (err) {
        resolve({ error: 1, message: 'Error deleting source', data: [] })
      }

      // Resolve
      resolve({ error: 0, message: 'Source deleted successfully', data: numRemoved })
    })
  })
}

// export
module.exports = {
  findAll,
  create,
  update,
  remove,
}
