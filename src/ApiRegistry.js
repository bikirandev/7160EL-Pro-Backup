const { BrowserWindow } = require('electron')
const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')

const getDirectory = require('./utils/getDirectory')
const { getSources, addSource, updateSource, deleteSource } = require('./Api/SourcesApi')

// /api/registration
const closeWindow = (ev, data) => {
  console.log(ev, data)

  // app.quit();
}

const minimizeWindow = (ev, data) => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.minimize()
  }
}


module.exports = {
  closeWindow,
  minimizeWindow,

  // sources
  getSources,
  addSource,
  updateSource,
  deleteSource,

  // destinations
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,

  // utils
  getDirectory
}
