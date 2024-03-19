const findAll = (db, findBy) => {
  return new Promise((resolve, reject) => {
    try {
      db.find(findBy, (err, docs) => {
        // Error handling
        if (err) {
          reject(new Error('Error on finding Sources'))
        }

        // Resolve
        resolve({ error: 0, message: 'List of Sources', data: docs })
      })
    } catch (e) {
      resolve({ error: 1, message: 'Error on finding Sources', data: [] })
    }
  })
}

const create = (db, data) => {
  return new Promise((resolve, reject) => {
    db.insert(data, (err, newDoc) => {
      // Error handling
      if (err) {
        reject(new Error('Error adding source'))
      }

      // Resolve
      resolve({ error: 0, message: 'Source created successfully', data: newDoc })
    })
  })
}

const update = (db, id, data) => {
  return new Promise((resolve, reject) => {
    db.update({ _id: id }, { $set: data }, {}, (err, numReplaced) => {
      // Error handling
      if (err) {
        reject(new Error('Error updating source'))
      }

      // Resolve
      resolve({ error: 0, message: 'Source updated successfully', data: numReplaced })
    })
  })
}

const remove = (db, id) => {
  return new Promise((resolve, reject) => {
    db.remove({ _id: id }, {}, (err, numRemoved) => {
      // Error handling
      if (err) {
        reject(new Error('Error deleting source'))
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
