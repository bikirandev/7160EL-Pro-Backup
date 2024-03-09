// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow } = require('electron');
// const { startDevice, stopDevice } = require('./app/device');
const createWindow = require('./utils/createWindow');

// '192.168.68.114', 4370
//   hide menu
// Menu.setApplicationMenu(false)

app.whenReady().then(() => {
  // Listen for 'set-title' event from renderer process
  // ipcMain.handle('set-title', (event, title) => {
  //   console.log('Title received from renderer process:', title);
  // });

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
