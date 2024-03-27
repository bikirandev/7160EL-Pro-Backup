const Execute = require('../../utils/Execute')
const mssql = require('mssql')
const path = require('path')
const tar = require('tar')
//const ncp = require('ncp').ncp
const { generateFilePath } = require('../Configs/ConfigModel')
const { copyDir, createDirForce, removeDir } = require('../../utils/FileOperation')

const mssqlWinExec = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'exec') {
    return { error: 0, message: 'Skipped', data: {}, skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: {}, skipped: false }
    }

    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: {}, skipped: false }
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
      return { error: 1, message: msg, data: {}, skipped: false }
    }

    if (stdout.includes('Incorrect syntax near the keyword')) {
      const msg = stdout.split('\n')[1]?.replace('\r', '') || 'Incorrect syntax near the keyword'
      return { error: 1, message: msg, data: {}, skipped: false }
    }

    return { error: 0, message: 'Backup', data: { ...result.data, backupPath }, skipped: false }
  } catch (e) {
    // console.log('Error on MSSQL Connection', e)
    return { error: 1, message: 'Error on MSSQL Connection', data: {}, skipped: false }
  }
}

const mssqlWinConnect = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-connection') {
    return { error: 0, message: 'Skipped', data: {}, skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: {}, skipped: false }
    }

    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: {}, skipped: false }
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

    console.log('result', result)
    return { error: 0, message: 'Connected', data: { ...result, backupPath }, skipped: false }
  } catch (e) {
    console.log('Error on MSSQL Connection', e)
    return { error: 1, message: 'Error on MSSQL Connection', data: {}, skipped: false }
  }
}

const mssqlWinDemo = async (data) => {
  const database = data.databaseOrPath
  console.log('database', database)

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-demo') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  return { error: 0, message: 'Demo', data: [] }
}

const directoryBackup = async (data) => {
  const sourcePath = data.databaseOrPath

  if (data.type !== 'directory') {
    return { error: 0, message: 'Skipped', data: [], skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.dirName) {
      return { error: 1, message: 'Unable to generate directory name', data: {}, skipped: false }
    }
    const tempPath = path.join(confBackupPath.data.defDirPath, '.temp', confBackupPath.data.dirName)

    // Create Directory if not exists
    await createDirForce(tempPath)

    // copy directory from source dir to temp dir
    await copyDir(sourcePath, tempPath)

    // create tar file of temp directory
    const tarPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.dirName) + '.tar'
    await tar.create({ gzip: true, file: tarPath, cwd: path.dirname(tempPath) }, [
      confBackupPath.data.dirName,
    ])

    // remove temp directory
    await removeDir(tempPath)

    return { error: 0, message: 'Backup', data: { backupPath: tarPath }, skipped: false }
  } catch (e) {
    console.log(e)
    return { error: 1, message: e.message, data: {}, skipped: false }
  }
}

module.exports = {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
  directoryBackup,
}
