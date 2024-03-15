const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('./Api/DestinationsApi')
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

  getSources,
  addSource,
  updateSource,
  deleteSource,

  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
}
