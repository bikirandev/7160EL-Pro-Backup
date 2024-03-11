// eslint-disable-next-line import/no-extraneous-dependencies
const { BrowserWindow, shell } = import('electron');
const path = require('path');
const startUrl = require('./startUrl');

module.exports = () => {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    resizable: false,
    titleBarStyle: 'hidden',

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload.js'),
    },
    // resizable: false,
  });

  // startUrl() returns http://localhost:3000 or ./build/index.html (React Build File)
  win.loadURL(startUrl());

  // url open
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  return win;
};
