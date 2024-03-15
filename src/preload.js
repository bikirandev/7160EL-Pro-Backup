/* eslint-disable import/no-extraneous-dependencies */
const {
  contextBridge,
  ipcRenderer: { send },
} = require('electron')

const apiRegistry = require('./ApiRegistry')
const obj = {}

// Library
const operation = (id) => (data) => send(id, data)
const adder = (id) => {
  obj[id] = operation(id)
}

const keys = Object.keys(apiRegistry)
keys.forEach((key) => {
  adder(key)
})

contextBridge.exposeInMainWorld('electronAPI', obj)
