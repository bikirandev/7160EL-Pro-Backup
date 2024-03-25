const { BrowserWindow, dialog } = require('electron')
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')
const { getSources, addSource, updateSource, deleteSource, backupAction } = require('./Api/SourcesApi')
const openLink = require('./utils/openLink')
const { getConfigs, setDefaultDirectory } = require('./Api/ConfigApi')

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
  closeWindow,
  minimizeWindow,

  getSources,
  addSource,
  updateSource,
  deleteSource,

  //backup process
  backupAction,


  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,

  //open link in external browser
  openLink,
  openDirectoryDialog,

  getConfigs,
  setDefaultDirectory,
}
