/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const createWindow = require('./utils/createWindow')
const apiRegistry = require('./ApiRegistry')
const { api } = require('./Api/Api')

const regKeys = Object.keys(apiRegistry)

app
  .whenReady()
  .then(() => {
    regKeys.forEach((key, index) => {
      ipcMain.handle(key, apiRegistry[key])
    })

    // --Creating Window // it returns win
    createWindow({ BrowserWindow, shell })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch((err) => {
    console.log(err)
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
