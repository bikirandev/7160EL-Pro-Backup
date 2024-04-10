const fsp = require('fs').promises
const path = require('path')
const { setDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const { DB_CONFIG, getAllDocuments, getDocument } = require('../utils/PouchDbTools')
const { isDirExists } = require('../utils/FileOperation')
const ConfigKeys = require('../Models/Configs/ConfigKeys')
const { exportingData, resetData, importingData } = require('../Models/Maintenance/Maintenance')
const { getTasksStatus } = require('../Models/Tasks/TasksModel')

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

const resetConfig = async () => {
  try {
    await resetData()

    return { error: 0, message: 'Config Reset Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const exportConfig = async (ev, data) => {
  // data.savedPath = ''

  // Collect Sources
  try {
    const dirExist = await isDirExists(data.savedPath)
    if (dirExist.error) {
      return { error: 1, message: 'Saved Directory not exists', data: null }
    }

    // Exporting Data
    const exportSt = await exportingData(data.savedPath)
    if (exportSt.error) {
      return exportSt
    }

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

    // importing Data
    const importSt = await importingData(data.configPath)
    if (importSt.error) {
      return importSt
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

  try {
    // 1. Cleanup Default Directory
    // 2. Export Configurations to local
    // 3. Export Configurations to remote
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on cleanup default directory', data: null }
  }
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
