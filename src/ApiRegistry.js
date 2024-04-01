const { BrowserWindow, dialog } = require('electron')
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')
const { getSources, addSource, updateSource, deleteSource } = require('./Api/SourcesApi')
const openLink = require('./utils/openLink')
const { getConfigs, setDefaultDirectory } = require('./Api/ConfigApi')
const { linkDestination, forceBackup, updateAutoStart, updateFrequency, getRecentBackups } = require('./Api/SourceBackupApi')
const exploreDirectory = require('./utils/exploreDirectory')
const { scheduleStart, scheduleStop } = require('./Api/ScheduleApi')
const { getTasksStatus } = require('./Models/Tasks/TasksModel')
const { inti } = require('./Api/InitApi')

// /api/registration
const closeWindow = (ev, data) => {
  console.log(ev, data)

  // app.quit();
}

const minimizeWindow = () => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.minimize()
  }
}
// Open Directory Dialog
const openDirectoryDialog = async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.filePaths[0]
}

module.exports = {
  inti,
  closeWindow,
  minimizeWindow,

  getSources,
  addSource,
  updateSource,
  updateAutoStart,
  updateFrequency,
  deleteSource,

  scheduleStart,
  scheduleStop,

  //link destination to source
  linkDestination,

  // backup force
  forceBackup,

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
