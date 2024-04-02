const mssql = require('mssql')
const defaultValues = require('../../../Default/DefaultValue')

const sourceDataPattern = {
  type: '',
  title: '',
  host: 'localhost',
  port: 0,
  databaseOrPath: '',
  user: '',
  password: '',
  operation: '',
  destinationId: 'default', // default or destinationId
  frequency: defaultValues.frequency,
  frequencyPattern: '0 * * * * *', // Hourly
  backupQuantity: defaultValues.backupQuantity,
  backupRetention: defaultValues.backupRetention,
  autostart: true,
  manualStop: false,
}

const sourceTypes = {
  TYPE_MSSQL_WIN: 'mssql-win',
  TYPE_MSSQL_HOST: 'mssql-host',
  TYPE_PGSQL: 'pgsql',
  TYPE_DIRECTORY: 'directory',
}

const validateType = (data) => {
  const nTypes = Object.values(sourceTypes)
  if (!nTypes.includes(data.type)) {
    return { error: 1, message: 'Type is not valid', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
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
      if (err) {
        reject('Error connecting to the database')
      } else {
        resolve({ error: 0, message: 'Connection to the database successful', data: null })
      }
    })
  })
}

const validateMssqlWinData = (data) => {
  if (data.type !== 'mssql-win') {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validateMssqlHostData = (data) => {
  if (data.type !== 'mssql-host') {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validatePgsqlData = (data) => {
  if (data.type !== 'pgsql') {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validateDirectory = (data) => {
  if (data.type !== 'directory') {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Path is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
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
