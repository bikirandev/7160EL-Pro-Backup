const fsp = require('fs').promises
const path = require('path')
const { setDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const {
  DB_CONFIG,
  DB_DESTINATION,
  DB_SOURCE,
  DB_UPLOADS,
  getAllDocuments,
  getDocument,
  emptyDocument,
  createDocument,
} = require('../utils/PouchDbTools')
const { isDirExists, createDirForce, isFileExists } = require('../utils/FileOperation')
const ConfigKeys = require('../Models/Configs/ConfigKeys')
const { getTasksStatus } = require('../ApiRegistry')

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

const resetConfig = async (ev, data) => {
  console.log('Reset Config', data)

  try {
    await emptyDocument(DB_SOURCE)
    await emptyDocument(DB_DESTINATION)
    await emptyDocument(DB_UPLOADS)
    await emptyDocument(DB_CONFIG)
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const exportConfig = async (ev, data) => {
  console.log('Export Config', data)
  // data.savedPath = ''

  // Collect Sources
  try {
    if (!data.savedPath) {
      const defDirConf = await getDocument(DB_CONFIG, ConfigKeys.CONF_DEFAULT_DIRECTORY)
      if (defDirConf.error) {
        return { error: 1, message: 'Default Directory not found', data: null }
      }

      // create directory if not exists
      data.savedPath = path.join(defDirConf.data.value, '.config')
      await createDirForce(data.savedPath)
    }

    const dirExist = await isDirExists(data.savedPath)
    if (dirExist.error) {
      return { error: 1, message: 'Saved Directory not exists', data: null }
    }

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

const importConfig = async (ev, data) => {
  // data.configPath = ''

  if (!data.configPath) {
    return { error: 1, message: 'Config Path not found', data: null }
  }

  try {
    // Check if task is running
    const tasks = getTasksStatus()
    if (tasks.length > 0) {
      return {
        error: 1,
        message: 'Tasks are running. Please stop them before importing the config.',
        data: null,
      }
    }

    const fileExist = await isFileExists(data.configPath)
    if (!fileExist.error) {
      return { error: 1, message: 'Selected Directory not exists', data: null }
    }

    // Read File
    const fileData = await fsp.readFile(data.configPath)
    const jsonData = JSON.parse(fileData)
    if (!jsonData) {
      return { error: 1, message: 'Invalid Config File', data: null }
    }

    // Reset Config
    const resetSt = await resetConfig()
    if (resetSt.error) {
      return resetSt
    }

    // Import Sources
    for (const source of jsonData.sources || []) {
      // remove _rev
      delete source._rev
      await createDocument(DB_SOURCE, source)
    }

    // Import Destinations
    for (const destination of jsonData.destinations || []) {
      // remove _rev
      delete destination._rev
      await createDocument(DB_DESTINATION, destination)
    }

    // Import Uploads
    for (const upload of jsonData.uploads || []) {
      // remove _rev
      delete upload._rev
      await createDocument(DB_UPLOADS, upload)
    }

    // Import Configs
    for (const config of jsonData.configs || []) {
      // remove _rev
      delete config._rev
      await createDocument(DB_CONFIG, config)
    }

    return { error: 0, message: 'Config Imported Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const defaultDirCleanup = async (ev, data) => {
  console.log('Default Directory Cleanup', data)
  try {
    // Collect Default Directory
    const defDirConf = await getDocument(DB_CONFIG, ConfigKeys.CONF_DEFAULT_DIRECTORY)
    if (defDirConf.error) {
      return { error: 1, message: 'Default Directory not found', data: null }
    }

    // Check if directory exists
    const dirExist = await isDirExists(defDirConf.data.value)
    if (dirExist.error) {
      return { error: 1, message: 'Default Directory not exists', data: null }
    }

    const excludeFiles = ['.config']

    // Cleanup Default Directory
    const files = await fsp.readdir(defDirConf.data.value)
    for (const file of files) {
      if (excludeFiles.includes(file)) {
        continue
      }
      const filePath = path.join(defDirConf.data.value, file)
      await fsp.rm(filePath, { recursive: true, force: true })
    }

    return { error: 0, message: 'Default Directory Cleaned Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on cleanup default directory', data: null }
  }
}

const maintenance = async (ev, data) => {
  // data = {}
  console.log('Maintenance', data)

  // 1. Cleanup Default Directory

  // 2. Backup Configurations to local

  // 3. Backup Configurations to remote
}

module.exports = {
  getConfigs,
  setDefaultDirectory,
  resetConfig,
  exportConfig,
  importConfig,
  defaultDirCleanup,
  maintenance,
}
