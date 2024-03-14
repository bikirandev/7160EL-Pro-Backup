/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const winston = require('winston/lib/winston/config');
const createWindow = require('./utils/createWindow');

app
  .whenReady()
  .then(() => {
    // close window
    ipcMain.on('close-window', () => {
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
    createWindow({ BrowserWindow, shell });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((err) => {
    winston.error(err);
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
