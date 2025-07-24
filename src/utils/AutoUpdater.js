const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron')
const log = require('electron-log')

// Configure logging
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.setupAutoUpdater()
  }

  setupAutoUpdater() {
    try {
      // Check for updates when the app starts
      autoUpdater.checkForUpdatesAndNotify()

      // Auto updater events
      autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...')
        this.sendStatusToWindow('Checking for update...')
      })

      autoUpdater.on('update-available', (info) => {
        log.info('Update available.')
        this.sendStatusToWindow('Update available.')
        
        // Show dialog to user
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'Update Available',
          message: `A new version (${info.version}) is available. It will be downloaded in the background.`,
          buttons: ['OK']
        })
      })

      autoUpdater.on('update-not-available', () => {
        log.info('Update not available.')
        this.sendStatusToWindow('Update not available.')
      })

      autoUpdater.on('error', (err) => {
        log.error('Error in auto-updater. ' + err)
        this.sendStatusToWindow('Error in auto-updater')
      })

      autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
        log.info(log_message)
        this.sendStatusToWindow(log_message)
      })

      autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded')
        this.sendStatusToWindow('Update downloaded')
        
        // Show dialog to restart and install
        const response = dialog.showMessageBoxSync(this.mainWindow, {
          type: 'info',
          title: 'Update Ready',
          message: `Update has been downloaded. Restart the application to apply the update (version ${info.version}).`,
          buttons: ['Restart Now', 'Later'],
          defaultId: 0
        })

        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
    } catch (error) {
      log.error('Failed to setup auto-updater:', error)
      console.error('Auto-updater setup failed:', error)
    }
  }

  sendStatusToWindow(text) {
    log.info(text)
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('updater-status', text)
    }
  }

  // Manual check for updates
  checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify()
  }

  // Force download and install
  downloadAndInstall() {
    autoUpdater.downloadUpdate()
  }
}

module.exports = AutoUpdater
