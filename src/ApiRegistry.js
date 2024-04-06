const { dialog } = require('electron') // BrowserWindow,
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')
const {
  getSources,
  addSource,
  updateSource,
  deleteSource,
  linkDestination,
} = require('./Api/SourcesApi')
const openLink = require('./utils/openLink')
const { getConfigs, setDefaultDirectory } = require('./Api/ConfigApi')
const {
  updateAutoStart,
  updateFrequency,
  getRecentBackups,
  downloadBackup,
} = require('./Api/SourceBackupApi')
const exploreDirectory = require('./utils/exploreDirectory')
const { scheduleStart, scheduleStop } = require('./Api/ScheduleApi')
const { getTasksStatus } = require('./Models/Tasks/TasksModel')
const { init } = require('./Api/InitApi')
const { forceBackup } = require('./Models/Backup/BackupForce')

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

  //open directory in file explorer
  exploreDirectory,

  //get tasks status
  getTasksStatus,
}
