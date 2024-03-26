const Execute = require('../../utils/Execute')
const mssql = require('mssql')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const tar = require('tar')
//const ncp = require('ncp').ncp
const { generateFilePath } = require('../Configs/ConfigModel')

const mssqlWinExec = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'exec') {
    return { error: 0, message: 'Skipped', data: {}, skipped: true }
  }

  const { defDirPath, fileName } = await generateFilePath(data)
  const backupPath = path.join(defDirPath, fileName)
  if (!backupPath) {
    return { error: 1, message: 'Error on Default Backup Path', data: {}, skipped: false }
  }

  try {
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

  const { defDirPath, fileName } = await generateFilePath(data)
  const backupPath = path.join(defDirPath, fileName)
  if (!backupPath) {
    return { error: 1, message: 'Error on Default Backup Path', data: {}, skipped: false }
  }

  try {
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

  const { defDirPath, dirName } = await generateFilePath(data)
  const tempPath = path.join(defDirPath, '.temp', dirName)

  try {
    // Create Directory if not exists
    if (!fs.existsSync(tempPath)) {
      fse.ensureDirSync(tempPath)
    }

    // copy file from source to temp
    await fse.copy(sourcePath, tempPath, { overwrite: true })

    // create tar file of temp directory
    const tarPath = path.join(defDirPath, dirName + '.tar')
    await tar.create({ gzip: true, file: tarPath, cwd: path.dirname(tempPath) }, [dirName])
    // console.log('Tar Created', tarPath)

    // remove temp directory
    await fse.remove(tempPath)
    // console.log('Temp Removed', tempPath)

    return { error: 0, message: 'Backup', data: { backupPath: tarPath }, skipped: false }
  } catch (e) {
    // console.log('Error on Directory Backup', e)
    return { error: 1, message: 'Error on Directory Backup', data: {}, skipped: false }
  }
}

module.exports = {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
  directoryBackup,
}
