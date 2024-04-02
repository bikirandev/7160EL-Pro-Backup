const { getAllDocuments, DB_CONFIG } = require('../../utils/PouchDbTools')
const moment = require('moment')

// const configPattern = {
//   key: '',
//   value: '',
// }

const configKeys = {
  CONF_DEFAULT_DIRECTORY: 'defaultDirectory',
}

const getDefaultDirectory = async () => {
  try {
    // Collect Default Directory
    const configs = await getAllDocuments(DB_CONFIG)
    const defaultDirectory = configs.find((x) => x.key === configKeys.CONF_DEFAULT_DIRECTORY)
    if (!defaultDirectory) {
      return { error: 1, message: 'Default Directory Not Configured', data: null }
    }

    return { error: 0, message: 'Default Directory', data: defaultDirectory }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Default Directory', data: null }
  }
}

const generateFilePath = async (sourceData) => {
  const dateNow = moment().format('YYYYMMDD_HHmmss')

  if (sourceData.type === 'directory') {
    return { error: 0, message: 'Directory Path', data: null, skipped: true }
  }

  try {
    // Default Directory
    const defaultDirectory = await getDefaultDirectory()
    if (defaultDirectory.error !== 0) {
      return defaultDirectory
    }
    const defDirPath = defaultDirectory.data.value

    // File Name
    const fileName = `${sourceData.type}_${sourceData.databaseOrPath}_${dateNow}.bak`

    // File Path
    return { error: 0, message: 'File Path', data: { defDirPath, fileName } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

const generateDirPath = async (sourceData) => {
  const dateNow = moment().format('YYYYMMDD_HHmmss')

  if (sourceData.type !== 'directory') {
    return { error: 0, message: 'DB Path', data: null, skipped: true }
  }

  try {
    // Default Directory
    const defaultDirectory = await getDefaultDirectory()
    if (defaultDirectory.error !== 0) {
      return defaultDirectory
    }
    const defDirPath = defaultDirectory.data.value

    const dName = sourceData.databaseOrPath.replace(/[^a-zA-Z0-9]/g, '_')
    const dirName = `directory_${dateNow}_${dName}`

    return { error: 0, message: 'Directory Path', data: { defDirPath, dirName } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

module.exports = {
  configKeys,
  getDefaultDirectory,
  generateFilePath,
  generateDirPath,
}
