const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { getDocument, DB_SOURCE } = require('../../utils/PouchDbTools')
const { validateAll } = require('../../utils/Validate')
const { createBackupLog, createErrorLog } = require('../Logs/LogCreate')
const { getDestination } = require('../Destinations/DestinationModel')
const { mssqlWinExecBackup } = require('../BackupLocal/BackupLocalMssql')
const { dirBackup } = require('../BackupLocal/BackupLocalDir')
const { backupToBucket2 } = require('../GoogleBackup/GoogleBackup')
const { getFileSizeHr } = require('../../utils/FileOperation')

// force backup
const forceBackup = async (ev, id) => {
  try {
    // Message & Log
    var timeStart = moment().unix()
    createBackupLog(id, 'Backup started')

    // Step-1: Get source configuration
    const sourceData = await getDocument(DB_SOURCE, id)
    if (!sourceData) {
      createBackupLog(id, 'Source not exists')
      return { error: 1, message: 'Source not exists', data: null }
    }

    const destinationId = sourceData.destinationId
    if (!destinationId) {
      createBackupLog(id, 'Destination not linked')
      return { error: 1, message: 'Destination not linked', data: null }
    }

    // Step-3: Collect destination configuration
    const destConfig = await getDestination(destinationId)
    if (destConfig.title === '') {
      createBackupLog(id, 'Destination config not found')
      return { error: 1, message: 'Destination config not found', data: null }
    }

    // Execution
    const exe1 = await mssqlWinExecBackup(sourceData)
    const exe2 = await dirBackup(sourceData)

    // Step-4: Execute backup
    const backupSt = validateAll([exe1, exe2])
    if (backupSt.error !== 0) {
      createBackupLog(id, 'Backup failed: ' + backupSt.message)
      return backupSt
    }
    if (!backupSt?.data?.backupPath) {
      createBackupLog(id, 'Backup path not found')
      return { error: 1, message: 'Backup path not found', data: null }
    }
    const backupPath = backupSt.data.backupPath // Important
    const basename = path.basename(sourceData.databaseOrPath)

    // Step-5: Upload to destination
    await backupToBucket2(id, backupPath, destConfig, `${sourceData.type}/${basename}`, false)

    // Get file size human readable
    const fileSize = fs.statSync(backupPath).size
    const fileSizeHr = getFileSizeHr(fileSize)

    // Step-6: Remove local file
    fs.unlinkSync(backupPath)

    createBackupLog(
      id,
      'Backup completed after ' +
        (moment().unix() - timeStart) +
        ' seconds, File size: ' +
        fileSizeHr +
        '\n\n',
    )
    return { error: 0, message: 'Backup successful', data: null }
  } catch (err) {
    createErrorLog(id + ' Error on force backup: ' + err)
    return { error: 1, message: 'Error on force backup', data: null }
  }
}

module.exports = { forceBackup }
