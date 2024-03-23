const mssql = require('mssql')

const mssqlDataPattern = {
  type: 'mssql-win',
  host: 'localhost',
  databaseOrPath: '',
  user: '',
  password: '',
}

const validateMssqlWin = (dbName) => {
  // mssql find db name, windows authentication
  const config = {
    server: 'localhost',
    database: dbName,
    options: {
      trustedConnection: true,
    },
  }

  return new Promise((resolve, reject) => {
    mssql.connect(config, (err) => {
      console.log(err)
      if (err) {
        reject('Error connecting to the database')
      } else {
        resolve({ error: 0, message: 'Connection to the database successful', data: [] })
      }
    })
  })
}

const validateMssqlWinData = (data) => {
  if (data.type !== 'mssql-win') {
    return { error: 1, message: 'Invalid data type', data: [] }
  }

  if (data.host === '') {
    return { error: 1, message: 'Host is required', data: [] }
  }

  if (data.databaseOrPath === '') {
    return { error: 1, message: 'Database is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

// Export
module.exports = {
  mssqlDataPattern,
  validateMssqlWin,
  validateMssqlWinData,
}
