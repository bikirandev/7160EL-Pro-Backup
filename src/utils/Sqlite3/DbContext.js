/* eslint-disable import/no-extraneous-dependencies */
const sqlite3 = require('sqlite3').verbose()

const DB_NAME = 'BackupProDb.db'

const GetValues = (keys) =>
  keys.map((key) => {
    if (model._DataKeys[key] === 'TEXT') {
      return `'${model[key]}'`
    }

    return model[key]
  })

const Add = async (model) => {
  // _DataKeys
  const keys = Object.keys(model._DataKeys)

  // Values
  const values = GetValues(keys)

  // Delete item from values where key is Id, because it's autoincrement and we don't need to
  const idIndex = keys.indexOf('Id')
  if (idIndex !== -1) {
    keys.splice(idIndex, 1)
    values.splice(idIndex, 1)
  }

  // sqlite3 insert query
  const insertQuery = `INSERT INTO ${model._DataName} (${keys.join(',')}) VALUES (${values.join(',')})`

  // sqlite3 insert
  const db = new sqlite3.Database(DB_NAME)

  const result = await new Promise((resolve, reject) => {
    db.run(insertQuery, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this)
      }
    })
  })

  const lastInsertedId = result.lastID // Get the last inserted ID
  db.close()

  return lastInsertedId
}

const Update = async (model) => {
  // _DataKeys
  const keys = Object.keys(model._DataKeys)

  // Values
  const setClause = keys.map((key) => `${key} = ?`).join(', ')

  // sqlite3 update query with parameterized query
  const updateQuery = `UPDATE ${model._DataName} SET ${setClause} WHERE Id = ?`

  // sqlite3 update
  const db = new sqlite3.Database(DB_NAME)
  const result = await new Promise((resolve, reject) => {
    const values = keys.map((key) => model[key])
    values.push(model.Id)

    db.run(updateQuery, values, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this)
      }
    })
  })

  db.close()

  // return
  return result
}

const GetById = async (model, id) => {
  // sqlite3 database
  const db = new sqlite3.Database(DB_NAME)

  // sqlite3 select query with parameterized query
  const selectQuery = `SELECT * FROM ${model._DataName} WHERE Id = ?`

  // sqlite3 select with parameterized query
  const result = await new Promise((resolve, reject) => {
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })

  db.close()

  // Attache Data Types
  result._DataName = model._DataName
  result._DataKeys = model._DataKeys

  return result
}

const GetAll = async (model) => {
  // sqlite3 database
  const db = new sqlite3.Database(DB_NAME)

  // sqlite3 select query
  const selectQuery = `SELECT * FROM ${model._DataName}`

  // sqlite3 select
  const result = await new Promise((resolve, reject) => {
    db.all(selectQuery, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })

  db.close()

  // Attache Data Types
  result.forEach((row) => {
    row._DataName = model._DataName
    row._DataKeys = model._DataKeys
  })

  return result
}

const InitiateTable = async (model) => {
  // sqlite3 database
  const db = new sqlite3.Database(DB_NAME)

  const dataType = model._DataKeys
  const keys = Object.keys(model._DataKeys)

  const sql = keys.map((key) => `${key} ${dataType[key]}`)

  // sqlite3 create table query
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${model._DataName} (${sql.join(',')})`

  // sqlite3 create table
  const result = await db.run(createTableQuery)
  db.close()

  return result
}

// Export
module.exports = {
  Add,
  Update,
  GetById,
  GetAll,
  InitiateTable,
}
