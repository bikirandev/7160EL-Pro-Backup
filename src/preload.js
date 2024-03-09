// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),

  // device acivity
  // deviceStart: (formData) => ipcRenderer.invoke('device:start', formData),
});
