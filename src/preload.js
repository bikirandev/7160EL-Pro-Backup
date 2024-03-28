const electron = require('electron')

// Check if ipcRenderer is available
if (electron && electron.ipcRenderer) {
  const { contextBridge, ipcRenderer } = electron

  const apiRegistry = require('./ApiRegistry')
  const obj = {}

  const keys = Object.keys(apiRegistry)
  keys.forEach((key) => {
    // Sender
    obj[key] = (data) => ipcRenderer.invoke(key, data)
  })

  // add Listener
  ipcRenderer.on('task-status', (ev, data) => {
    console.log('T Status: ', data, ev)
  })

  // remove Listener
  ipcRenderer.removeAllListeners('task-status')

  contextBridge.exposeInMainWorld('electronAPI', obj)
} else {
  console.error('ipcRenderer is not available')
}
