/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron')
const apiRegistry = require('./ApiRegistry')
const { createWindow } = require('./utils/createWindow')
const { showNotification } = require('./Models/Notification/Notification')

const regKeys = Object.keys(apiRegistry)
app.setAppUserModelId('com.bikiran.probackup') // Replace with your specifics

let tray = null
let win = null

app.on('ready', () => {
  // Create and display a tray icon
  tray = new Tray('./src/assets/backup-pro-logo.png')
  tray.setToolTip('Pro Backup')

  // Open window on tray icon click
  tray.on('click', () => {
    win.show()
  })

  // Add tray context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win.show()
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)

  regKeys.forEach((key) => {
    ipcMain.handle(key, apiRegistry[key])
  })

  // Notification
  showNotification('Pro Backup is running...')

  // --Creating Window // it returns win
  win = createWindow({ BrowserWindow, shell })
})
