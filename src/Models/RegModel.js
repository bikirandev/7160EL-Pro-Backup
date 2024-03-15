const {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
} = require('../Api/DestinationsApi')
const { getSources, addSource, updateSource, deleteSource } = require('../Api/SourcesApi')

const obj = {}

// /api/registration
obj.closeWindow = (ev, data) => {
  console.log(ev, data)

  // app.quit();
}

obj.minimizeWindow = (ev, data) => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.minimize()
  }
}

obj.getSource = getSources
obj.addSource = addSource
obj.updateSource = updateSource
obj.deleteSource = deleteSource

obj.getDestinations = getDestinations
obj.addDestination = addDestination
obj.updateDestination = updateDestination
obj.deleteDestination = deleteDestination

module.exports = obj
