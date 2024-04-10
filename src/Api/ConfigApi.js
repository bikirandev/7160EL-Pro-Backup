const fsp = require('fs').promises
const path = require('path')
const { setDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const {
  DB_CONFIG,
  DB_DESTINATION,
  DB_SOURCE,
  DB_UPLOADS,
  getAllDocuments,
} = require('../utils/PouchDbTools')
const { isDirExists } = require('../utils/FileOperation')

const getConfigs = async () => {
  try {
    const data = await getAllDocuments(DB_CONFIG)

    return { error: 0, message: 'List of Sources', data: data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const setDefaultDirectory = async (ev, data) => {
  const directory = data.directory

  // Create of Update new Line
  try {
    await setDefDirectory(directory)

    return { error: 0, message: 'Default Directory Set', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const exportConfig = async (ev, data) => {
  console.log('Export Config', data)
  // data.savedPath = ''

  if (!data.savedPath) {
    return { error: 1, message: 'Saved directory path not found', data: null }
  }

  if (!isDirExists(data.savedPath)) {
    return { error: 1, message: 'Saved Directory not exists', data: null }
  }

  // Collect Sources
  try {
    const sources = await getAllDocuments(DB_SOURCE)
    const destinations = await getAllDocuments(DB_DESTINATION)
    const uploads = await getAllDocuments(DB_UPLOADS)
    const configs = await getAllDocuments(DB_CONFIG)

    const dataConf = JSON.stringify({ sources, destinations, uploads, configs }, null, 2)

    // Generate Path
    const filename = `config-exported.json`
    const filePath = path.join(data.savedPath, filename)

    // Write to file
    await fsp.writeFile(filePath, dataConf)

    return { error: 0, message: 'Config Exported Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  getConfigs,
  setDefaultDirectory,
  exportConfig,
}
