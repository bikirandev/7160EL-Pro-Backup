/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const { BrowserWindow, shell } = require('electron');
const startUrl = require('./startUrl');

module.exports = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 700,
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
