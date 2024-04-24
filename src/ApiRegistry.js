const openLink = require('./utils/openLink')
const exploreDirectory = require('./utils/exploreDirectory')
const { dialog } = require('electron') // BrowserWindow,
const { scheduleStart, scheduleStop } = require('./Api/ScheduleApi')
const { getTasksStatus } = require('./Models/Tasks/TasksModel')
const { forceBackup } = require('./Models/Backup/BackupForce')
const { updateAutoStart, updateFrequency } = require('./Api/SourcesUpdateApi')
const { getLogFiles, downloadLogFile, deleteLogFile, emptyLogFiles } = require('./Api/LogsApi')
const { init } = require('./Api/InitApi')
const {
  getConfigs,
  setDefaultDirectory,
  defaultDirCleanup,
  setNotificationEmail,
} = require('./Api/ConfigApi')
const { syncBackup } = require('./Models/Backup/BackupSync')
const { setSMTPConfig, testSMTPConfig } = require('./Api/ConfigSmtpApi')
const { setDumpPath, testDumpPath } = require('./Api/ConfigDumpApi')
const {
  resetConfig,
  exportConfig,
  importConfig,
  restoreFromRemote,
} = require('./Api/ConfigOperationApi')
const {
  getSources,
  addSource,
  updateSource,
  deleteSource,
  linkDestination,
} = require('./Api/SourcesApi')
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')
const {
  getRecentBackups,
  downloadBackup,
  removeBackup,
  cleanupBackups,
} = require('./Api/SourcesBackupApi')
const { reloadWindow } = require('./utils/createWindow')

// /api/registration
// const closeWindow = (ev, data) => {
//   // app.quit();
// }

// const minimizeWindow = () => {
//   const focusedWindow = BrowserWindow.getFocusedWindow()
//   if (focusedWindow) {
//     focusedWindow.minimize()
//   }
// }

// Open Directory Dialog
const openDirectoryDialog = async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.filePaths[0]
}

const openFileDialog = async (ev, fileType = null) => {
  let filters = null

  if (fileType) {
    // Define filters based on the provided file type
    filters = [{ name: 'Custom File Type', extensions: [fileType] }]
  }

  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters,
  })

  return result.filePaths[0]
}

module.exports = {
  init,

  // Sources API
  getSources,
  addSource,
  updateSource,
  updateAutoStart,
  updateFrequency,
  downloadBackup,
  forceBackup,
  syncBackup,
  deleteSource,

  // Schedule/Task API
  scheduleStart,
  scheduleStop,
  getTasksStatus,

  //link destination to source
  linkDestination,
  removeBackup,
  cleanupBackups,

  // Uploads API
  getRecentBackups,
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,

  // Configs API
  getConfigs,
  setDefaultDirectory,
  setNotificationEmail,
  resetApp: resetConfig,
  exportConfig,
  importConfig,
  restoreFromRemote,
  defaultDirCleanup,

  // SMTP Config API
  setSMTPConfig,
  testSMTPConfig,

  // Dump Config API
  setDumpPath,
  testDumpPath,

  // Logs API
  getLogFiles,
  downloadLogFile,
  deleteLogFile,
  emptyLogFiles,

  //open link in external browser
  openLink,
  exploreDirectory,
  openDirectoryDialog,
  openFileDialog,

  reloadWindow,
}
