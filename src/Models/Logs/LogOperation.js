const fsp = require('fs').promises
const path = require('path')
const moment = require('moment')
const { filesInfo } = require('../../utils/FileOperation')
const { LOG_DIR_LOCAL, LOG_DIR_REMOTE, createErrorLog } = require('./LogCreate')
const { getFiles, backupToBucket2, removeFile } = require('../GoogleBackup/GoogleBackup')
const { getDestination } = require('../Destinations/DestinationModel')

const LOCAL_RETAIN_DAYS = 10
const REMOTE_RETAIN_DAYS = 30

const logFilesFixing = async (timeNow) => {
  const thisHour = moment().format('YYYY_MM_DD_HH')
  // console.log(timeNow)

  try {
    // 1. Read all logs form logs folder
    // Read files with  time created
    const files = await fsp.readdir(LOG_DIR_LOCAL)
    const filesFullPath = files.map((file) => path.join(LOG_DIR_LOCAL, file))
    let fInfo = await filesInfo(filesFullPath)

    // Filter files except create the running hour
    fInfo = fInfo.filter((file) => {
      console.log('file', file)
      const createdHour = moment.unix(file.created).format('YYYY_MM_DD_HH')

      return createdHour !== thisHour
    })

    /* fInfo = [
        {
            file: 'Logs\\Log_Backup_2024_04_10_21.log',
            name: 'Log_Backup_2024_04_10_21.log',
            created: 1712762159,
            updated: 1712762161,
            size: 550,
            sizeHr: '550 B'
        }
    ] */

    // Remove all Log Files that are older than 10 days
    const oldest = timeNow - LOCAL_RETAIN_DAYS * 24 * 60 * 60
    console.log('timeNow', moment.unix(timeNow).format('YYYY-MM-DD HH:mm:ss'))
    console.log('oldest', moment.unix(oldest).format('YYYY-MM-DD HH:mm:ss'))
    const oldFiles = fInfo.filter((file) => file.created < oldest) // For Delete Operation
    const newFiles = fInfo.filter((file) => file.created >= oldest) // For Remote Upload Operation
    //   .map((file) => {
    //     return { ...file, createdTxt: moment.unix(file.created).format('YYYY-MM-DD HH:mm:ss') }
    //   })

    console.log(oldFiles)
    console.log(newFiles)

    //--Collect Default Destination Configuration
    const destConfig = await getDestination('default')
    if (destConfig.error) {
      return { error: 1, message: 'Default Destination not found', data: null }
    }

    // Collect Remote Files From Google Bucket
    const remoteFilesSt = await getFiles(destConfig.data, LOG_DIR_REMOTE)
    if (remoteFilesSt.error) {
      return { error: 1, message: 'Error on getting remote files', data: null }
    }
    const remoteFiles = remoteFilesSt.data.map((file) => {
      return { ...file, fileName: path.basename(file.name) }
    })

    // Find oldest remote files
    const oldestRemote = timeNow - REMOTE_RETAIN_DAYS * 24 * 60 * 60
    const remoteFilesToDelete = remoteFiles.filter((file) => file.timeCreated < oldestRemote)

    // Filter non-existing files in the remote
    const nonExistingFiles = newFiles.filter((file) => {
      return !remoteFiles.find((rFile) => rFile.fileName === file.name)
    })

    // Upload non existing files to the remote
    for (const file of nonExistingFiles) {
      const fileFullPath = path.join(LOG_DIR_LOCAL, file.name)
      console.log('fileFullPath', fileFullPath)
      const uploadSt = await backupToBucket2('', fileFullPath, destConfig.data, LOG_DIR_REMOTE)
      if (uploadSt.error) {
        createErrorLog(`Error on uploading file ${file.name} to remote`)
      }
      console.log('uploadSt', uploadSt)
    }

    // Remove Local Files && Local Delete Operation
    for (const file of oldFiles) {
      console.log('file', file)
      await fsp.unlink(file.file)
    }

    // Remove Remote Files && Remote Delete Operation
    for (const file of remoteFilesToDelete) {
      const deleteSt = await removeFile(destConfig.data, file.name)
      if (deleteSt.error) {
        createErrorLog(`Error on deleting file ${file.name} from remote`)
      }
    }

    return { error: 0, message: 'Log files fixed successfully', data: null }
  } catch (err) {
    console.log(err)
    createErrorLog(err)
  }
}

module.exports = {
  logFilesFixing,
}
