const { getAllDocuments, DB_CONFIG } = require('../../utils/PouchDbTools')
const path = require('path')

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

const generateFilePath = (data) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // Default Directory
  const defaultDirectory = getDefaultDirectory()
  if (defaultDirectory.error !== 0) {
    return null
  }

  // File Name
  const fileName = `${data.type}_${data.databaseOrPath}_${year}${month}${day}_${hour}${minute}${second}.bak`

  // File Path
  return path.join(getDefaultDirectory().data.value, fileName)
}

module.exports = {
  configKeys,
  getDefaultDirectory,
  generateFilePath,
}
