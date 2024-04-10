const { dialog } = require('electron') // BrowserWindow,
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
const { getConfigs, setDefaultDirectory, exportConfig } = require('./Api/ConfigApi')
const { scheduleStart, scheduleStop } = require('./Api/ScheduleApi')
const { getTasksStatus } = require('./Models/Tasks/TasksModel')
const { forceBackup } = require('./Models/Backup/BackupForce')
const { updateAutoStart, updateFrequency } = require('./Api/SourcesUpdateApi')

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

module.exports = {
  init,

  getSources,
  addSource,
  updateSource,
  updateAutoStart,
  updateFrequency,
  downloadBackup,
  forceBackup,
  deleteSource,

  scheduleStart,
  scheduleStop,

  //link destination to source
  linkDestination,
  removeBackup,
  cleanupBackups,

  //all completed backups
  getRecentBackups,

  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,

  //open link in external browser
  openLink,
  openDirectoryDialog,

  getConfigs,
  setDefaultDirectory,
  exportConfig,

  //open directory in file explorer
  exploreDirectory,

  //get tasks status
  getTasksStatus,
}
