const { dialog } = require('electron') // BrowserWindow,
const { scheduleStart, scheduleStop } = require('./Api/ScheduleApi')
const { getTasksStatus } = require('./Models/Tasks/TasksModel')
const { forceBackup } = require('./Models/Backup/BackupForce')
const { updateAutoStart, updateFrequency } = require('./Api/SourcesUpdateApi')
const { getLogFiles, downloadLogFile, deleteLogFile, emptyLogFiles } = require('./Api/LogsApi')
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
const openLink = require('./utils/openLink')
const exploreDirectory = require('./utils/exploreDirectory')
const { init } = require('./Api/InitApi')
const {
  getConfigs,
  setDefaultDirectory,
  exportConfig,
  resetConfig,
  importConfig,
  defaultDirCleanup,
  restoreFromRemote,
} = require('./Api/ConfigApi')

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

const openFileDialog = async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] })
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
  resetApp: resetConfig,
  exportConfig,
  importConfig,
  restoreFromRemote,
  defaultDirCleanup,

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

  // SMTP Config API
  // setSMTPConfig,
  // testSMTPConfig,
}
