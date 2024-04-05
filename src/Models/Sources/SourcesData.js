const defaultValues = require('../../utils/DefaultValue')

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

// Export
module.exports = {
  sourceTypes,
  sourceDataPattern,
}
