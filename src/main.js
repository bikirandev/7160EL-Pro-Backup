/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const winston = require('winston/lib/winston/config')
const createWindow = require('./utils/createWindow')
const regModel = require('./Models/RegModel')

const regKeys = Object.keys(regModel)

app
  .whenReady()
  .then(() => {
    regKeys.forEach((key, index) => {
      ipcMain.on(key, regModel[key])
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
    winston.error(err)
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
