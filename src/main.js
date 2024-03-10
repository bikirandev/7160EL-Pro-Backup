// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
// const { startDevice, stopDevice } = require('./app/device');
const createWindow = require('./utils/createWindow');

// '192.168.68.114', 4370
//   hide menu
// Menu.setApplicationMenu(false)

app.whenReady().then(() => {
  // close window
  ipcMain.on('close-window', () => {
    console.log('Close Window:');
    app.quit();
  });

  // Listen for 'minimize-window' event from renderer process
  ipcMain.on('minimize-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.minimize();
    }
  });

  // --Creating Window // it returns win
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
