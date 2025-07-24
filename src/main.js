/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron')
const apiRegistry = require('./ApiRegistry')
const { setAuthToken } = require('./Api/AuthApi')
const { createWindow } = require('./utils/createWindow')
const { migrateDataDirectory } = require('./utils/DataMigration')
// const { showNotification } = require('./Models/Notification/Notification')
const path = require('path')

const regKeys = Object.keys(apiRegistry)
app.setAppUserModelId('com.bikiran.probackup') // Replace with your specifics
app.setAsDefaultProtocolClient('probackup'); // <-- custom protocol like myapp://

let tray = null
let win = null

app.on('ready', () => {
  // Migrate data directory on first startup
  migrateDataDirectory()

  const iconPath = path.join(__dirname, 'assets', 'backup-pro-logo.png')

  // Create and display a tray icon
  tray = new Tray(iconPath)
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
  // showNotification('Pro Backup is running...', iconPath)

  // --Creating Window // it returns win
  win = createWindow({ BrowserWindow, shell })

  // // Set application menu to show menubar
  // const template = [
  //   {
  //     label: 'File',
  //     submenu: [
  //       { role: 'reload' },
  //       { role: 'quit' }
  //     ]
  //   },
  //   {
  //     label: 'Edit',
  //     submenu: [
  //       { role: 'undo' },
  //       { role: 'redo' },
  //       { type: 'separator' },
  //       { role: 'cut' },
  //       { role: 'copy' },
  //       { role: 'paste' }
  //     ]
  //   },
  //   {
  //     label: 'View',
  //     submenu: [
  //       { role: 'reload' },
  //       { role: 'toggleDevTools' }
  //     ]
  //   }
  // ]
  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)
})

app.on('open-url', (event, url) => {
  event.preventDefault();

  const parsedUrl = new URL(url);
  const token = parsedUrl.searchParams.get('token');

  // Now you have the token! Use it to log in or validate
  console.log('Received token from browser:', token);

  // Store the token in AuthApi
  setAuthToken(token);

  // Send token to renderer process
  if (win && token) {
    win.webContents.send('auth-token-received', token);
  }
});

