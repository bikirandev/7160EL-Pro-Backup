const Execute = require('../../utils/Execute')
const mssql = require('mssql')
const path = require('path')
const { generateFilePath } = require('../Configs/ConfigModel')

const mssqlWinExec = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'exec') {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: null }
    }

    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: null }
    }
    // SQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S localhost -E -Q "${sql}"`

    // Execute
    const result = await Execute(command)
    const stdout = result?.data?.stdout || ''

    // Check if error
    if (stdout.includes('BACKUP DATABASE is terminating abnormally')) {
      const msg =
        stdout.split('\n')[1]?.replace('\r', '') || 'BACKUP DATABASE is terminating abnormally'
      return { error: 1, message: msg, data: null }
    }

    if (stdout.includes('Incorrect syntax near the keyword')) {
      const msg = stdout.split('\n')[1]?.replace('\r', '') || 'Incorrect syntax near the keyword'
      return { error: 1, message: msg, data: null }
    }

    return { error: 0, message: 'Backup', data: { ...result.data, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on MSSQL Connection', data: null }
  }
}

const mssqlWinConnect = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-connection') {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: null }
    }

    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: null }
    }

    mssql.connect({
      server: 'localhost',
      database: database,
      options: {
        trustedConnection: true,
      },
    })

    const pool = await mssql.connect()
    const result = await pool.request().query('SELECT 1')

    return { error: 0, message: 'Connected', data: { ...result, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on MSSQL Connection', data: null }
  }
}

const mssqlWinDemo = async (data) => {
  //const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-demo') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  return { error: 0, message: 'Demo', data: [] }
}

module.exports = {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
}
