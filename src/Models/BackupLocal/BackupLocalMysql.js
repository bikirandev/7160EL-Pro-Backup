const path = require('path')
const { generateFilePath } = require('../Configs/ConfigGenerateFs')
const { ExecuteMysql } = require('../../utils/Execute')
const { sourceTypes } = require('../Sources/SourcesData')

const mysqlHostBackup = async (sourceData) => {
  const database = sourceData.databaseOrPath

  if (sourceData.type !== sourceTypes.TYPE_MYSQL) {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    // Step-1: Generate File Path
    const confBackupPath = await generateFilePath(sourceData)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    // Verify File Name
    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: null }
    }

    // Verify Backup Path
    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: null }
    }

    const pgConfig = {
      user: sourceData.user,
      host: sourceData.host,
      database: database,
      password: sourceData.password,
      port: sourceData.port, // Default port is 3306
      dumpPath: path.join('"C:\\xampp\\mysql\\bin\\mysqldump.exe"'),
    }

    // Construct the pg_dump command
    const pgDumpCommand = `set "PGPASSWORD=${pgConfig.password}" && "${pgConfig.dumpPath}" -U ${pgConfig.user} -h ${pgConfig.host} -d ${pgConfig.database} -p ${pgConfig.port} > ${backupPath}`
    // console.log('pgDumpCommand', pgDumpCommand)

    // Step-2: Execute Backup
    const result = await ExecuteMysql(pgDumpCommand)
    if (result.error) {
      return result
    }

    return { error: 0, message: 'Backup successful', data: { ...result.data, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on PostgreSQL Connection', data: null }
  }
}

module.exports = {
  mysqlHostBackup,
}
