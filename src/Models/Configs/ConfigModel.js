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
      return { error: 1, message: 'Default Directory Not Configured', data: {} }
    }

    return { error: 0, message: 'Default Directory', data: defaultDirectory }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Default Directory', data: {} }
  }
}

const generateFilePath = async (data) => {
  const dateNow = moment().format('YYYYMMDD_HHmmss')

  try {
    // Default Directory
    const defaultDirectory = await getDefaultDirectory()
    if (defaultDirectory.error !== 0) {
      return defaultDirectory
    }
    const defDirPath = defaultDirectory.data.value

    if (data.type === 'directory') {
      const dName = data.databaseOrPath.replace(/[^a-zA-Z0-9]/g, '_')
      const dirName = `${data.type}_${dateNow}_${dName}`

      return { error: 0, message: 'Directory Path', data: { defDirPath, fileName: null, dirName } }
    }

    // File Name
    const fileName = `${data.type}_${data.databaseOrPath}_${dateNow}.bak`

    // File Path
    return { error: 0, message: 'File Path', data: { defDirPath, fileName, dirName: null } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: {} }
  }
}

module.exports = {
  configKeys,
  getDefaultDirectory,
  generateFilePath,
}
