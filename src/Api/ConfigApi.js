const {
  getAllDocuments,
  DB_CONFIG,
  createDocument,
  updateDocument,
} = require('../utils/PouchDbTools')

// const configPattern = {
//   key: '',
//   value: '',
// }

const configKeys = {
  CONF_DEFAULT_DIRECTORY: 'defaultDirectory',
}

const getConfigs = async () => {
  try {
    const data = await getAllDocuments(DB_CONFIG)
    console.log('Data Config:', data)

    return { error: 0, message: 'List of Sources', data: data }
  } catch (e) {
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

const setDefaultDirectory = async (ev, data) => {
  const directory = data.directory

  // Create of Update new Line
  try {
    const data = await getAllDocuments(DB_CONFIG)
    const defaultDirectory = data.find((x) => x.key === configKeys.CONF_DEFAULT_DIRECTORY)
    if (!defaultDirectory) {
      await createDocument(DB_CONFIG, { key: configKeys.CONF_DEFAULT_DIRECTORY, value: directory })
    } else {
      await updateDocument(DB_CONFIG, defaultDirectory._id, {
        key: configKeys.CONF_DEFAULT_DIRECTORY,
        value: directory,
      })
    }
    return { error: 0, message: 'Default Directory Set', data: [] }
  } catch (e) {
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

module.exports = {
  getConfigs,
  setDefaultDirectory,
}
