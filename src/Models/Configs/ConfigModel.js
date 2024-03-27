const { getAllDocuments, DB_CONFIG } = require('../../utils/PouchDbTools')

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

    return { error: 0, message: 'Default Directory', data: defaultDirectory }
  } catch (e) {
    return { error: 1, message: 'Error on finding Default Directory', data: {} }
  }
}

const generateFilePath = async (data) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  try {
    // Default Directory
    const defaultDirectory = await getDefaultDirectory()
    if (defaultDirectory.error !== 0) {
      return { error: 1, message: 'Default Directory Not Configured', data: {} }
    }
    const defDirPath = defaultDirectory.data.value

    if (data.type === 'directory') {
      const dName = data.databaseOrPath.replace(/[^a-zA-Z0-9]/g, '_')
      const dirName = `${data.type}_${year}${month}${day}_${hour}${minute}${second}_${dName}`

      return { error: 0, message: 'Directory Path', data: { defDirPath, fileName: null, dirName } }
    }

    // File Name
    const fileName = `${data.type}_${data.databaseOrPath}_${year}${month}${day}_${hour}${minute}${second}.bak`

    // File Path
    return { error: 0, message: 'File Path', data: { defDirPath, fileName, dirName: null } }
  } catch (e) {
    return { error: 1, message: e.message, data: {} }
  }
}

module.exports = {
  configKeys,
  getDefaultDirectory,
  generateFilePath,
}
