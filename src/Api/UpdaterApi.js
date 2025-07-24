const { ipcRenderer } = require('electron')

// Check for updates manually
const checkForUpdates = async () => {
  try {
    return await ipcRenderer.invoke('check-for-updates')
  } catch (error) {
    console.error('Error checking for updates:', error)
    throw error
  }
}

// Download and install update
const downloadUpdate = async () => {
  try {
    return await ipcRenderer.invoke('download-update')
  } catch (error) {
    console.error('Error downloading update:', error)
    throw error
  }
}

// Listen for updater status messages
const onUpdaterStatus = (callback) => {
  ipcRenderer.on('updater-status', (event, status) => {
    callback(status)
  })
}

// Remove updater status listener
const removeUpdaterStatusListener = () => {
  ipcRenderer.removeAllListeners('updater-status')
}

module.exports = {
  checkForUpdates,
  downloadUpdate,
  onUpdaterStatus,
  removeUpdaterStatusListener
}
