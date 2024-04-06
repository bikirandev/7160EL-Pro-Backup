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
  const isRunning = true
  if (isRunning) {
    win.on('close', function (event) {
      event.preventDefault() // Prevent window from closing immediately

      const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: '   ',
        message:
          'If you close the window, All background process will be stopped. Are you sure you want to close the window?',
      }

      dialog.showMessageBox(win, options).then((result) => {
        if (result.response === 1) {
          // Do nothing, prevent window from closing
        } else {
          win.destroy() // Close the window
        }
      })
    })
  }

  // url open
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  return win
}
