const electron = require('electron')

// Check if ipcRenderer is available
if (electron && electron.ipcRenderer) {
  const { contextBridge, ipcRenderer } = electron

  const apiRegistry = require('./ApiRegistry')
  const obj = {}

  const keys = Object.keys(apiRegistry)
  keys.forEach((key) => {
    // Sender
    obj[key] = (data) => ipcRenderer.send(key, data)

    // On Receiver
    obj[key + 'ReplyOn'] = (fn) => {
      ipcRenderer.on(key + 'ReplyOn', fn)
    }

    // Off Receiver
    obj[key + 'ReplyOff'] = () => {
      ipcRenderer.removeAllListeners(key + 'ReplyOn')
    }
  })

  // Message Sender
  obj.messageOn = (fn) => ipcRenderer.on('message', fn)
  obj.messageOff = () => ipcRenderer.removeAllListeners('message')

  contextBridge.exposeInMainWorld('electronAPI', obj)
} else {
  console.error('ipcRenderer is not available')
}
