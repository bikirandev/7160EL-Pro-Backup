const electron = require('electron')

// Check if ipcRenderer is available
if (electron && electron.ipcRenderer) {
  const { contextBridge, ipcRenderer } = electron

  const apiRegistry = require('./ApiRegistry')
  const apiReply = require('./ApiReply')
  const obj = {}

  const keys = Object.keys(apiRegistry)
  keys.forEach((key) => {
    // Sender
    obj[key] = (data) => ipcRenderer.send(key, data)
  })

  const replyKeys = Object.keys(apiReply)
  replyKeys.forEach((key) => {
    // Receiver
    obj[key] = (fn) => ipcRenderer.on(key, fn)

    // Off Sender
    obj[key + 'Off'] = () => ipcRenderer.removeAllListeners(key)
  })

  // Message Sender
  obj.messageOn = (fn) => ipcRenderer.on('message', fn)
  obj.messageOff = () => ipcRenderer.removeAllListeners('message')

  contextBridge.exposeInMainWorld('electronAPI', obj)
} else {
  console.error('ipcRenderer is not available')
}
