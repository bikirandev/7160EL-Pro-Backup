// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // close window
  closeWindow: (data) => ipcRenderer.send('close-window', data),

  // minimize window
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
});
