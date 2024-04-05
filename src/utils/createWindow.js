/* eslint-disable no-undef */
const path = require('path')
const startUrl = require('./startUrl')
const { dialog } = require('electron')

module.exports = ({ BrowserWindow, shell }) => {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    resizable: false,
    // titleBarStyle: 'hidden',
    // autoHideMenuBar : true,

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload.js'),
    },
    // resizable: false,
  })

  // startUrl() returns http://localhost:3000 or ./build/index.html (React Build File)
  win.loadURL(startUrl())

  // if any task is running, show a warning message before closing the window
  const isRunning = false
  if (isRunning) {
    win.on('close', function (event) {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: '   ',
        message:
          'Backup in progress. if you close the window, the backup will be stopped. Are you sure you want to close the window?',
      })

      if (choice === 1) {
        event.preventDefault() // Prevent window from closing
      }
    })
  }

  // url open
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  return win
}
