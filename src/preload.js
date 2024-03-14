/* eslint-disable import/no-extraneous-dependencies */
const {
  contextBridge,
  ipcRenderer: { send },
} = require('electron');

const obj = {};

const operation = (id) => (data) => send(id, data);
const adder = (id) => {
      obj[id] = operation(id);
};

   adder('closeWindow');
adder('minimizeWindow');

// getSources
// addSource
// updateSource
// removeSource

contextBridge.exposeInMainWorld('electronAPI', obj);
