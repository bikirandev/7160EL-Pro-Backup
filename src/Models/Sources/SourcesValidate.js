const mssql = require('mssql')

const sourceDataPattern = {
  type: '',
  host: 'localhost',
  databaseOrPath: '',
  user: '',
  password: '',
  operation: '',
}

const sourceTypes = {
  TYPE_MSSQL_WIN: 'mssql-win',
  TYPE_MSSQL_HOST: 'mssql-host',
  TYPE_PGSQL: 'pgsql',
  TYPE_DIRECTORY: 'directory',
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
    return { error: 0, message: 'Skipped', data: [] }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: [] }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: [] }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

const validateMssqlHostData = (data) => {
  if (data.type !== 'mssql-host') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: [] }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: [] }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: [] }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: [] }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

const validatePgsqlData = (data) => {
  if (data.type !== 'pgsql') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: [] }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: [] }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: [] }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: [] }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

const validateDirectory = (data) => {
  if (data.type !== 'directory') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Path is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

const validateType = (data) => {
  const nTypes = Object.values(sourceTypes)
  if (!nTypes.includes(data.type)) {
    return { error: 1, message: 'Type is not valid', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

// Export
module.exports = {
  sourceTypes,
  sourceDataPattern,
  validateMssqlWin,
  validateMssqlWinData,
  validateMssqlHostData,
  validatePgsqlData,
  validateDirectory,
  validateType,
}
