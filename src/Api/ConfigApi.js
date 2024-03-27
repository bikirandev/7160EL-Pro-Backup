const { configKeys } = require('../Models/Configs/ConfigModel')
const {
  getAllDocuments,
  DB_CONFIG,
  createDocument,
  updateDocument,
  generateHash,
} = require('../utils/PouchDbTools')

const getConfigs = async () => {
  try {
    const data = await getAllDocuments(DB_CONFIG)

    return { error: 0, message: 'List of Sources', data: data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

const setDefaultDirectory = async (ev, data) => {
  const directory = data.directory
  const id = generateHash()

  // Create of Update new Line
  try {
    const data = await getAllDocuments(DB_CONFIG)
    const defaultDirectory = data.find((x) => x.key === configKeys.CONF_DEFAULT_DIRECTORY)
    if (!defaultDirectory) {
      await createDocument(DB_CONFIG, {
        _id: id,
        key: configKeys.CONF_DEFAULT_DIRECTORY,
        value: directory,
      })
    } else {
      await updateDocument(DB_CONFIG, defaultDirectory._id, {
        key: configKeys.CONF_DEFAULT_DIRECTORY,
        value: directory,
      })
    }
    return { error: 0, message: 'Default Directory Set', data: [] }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

module.exports = {
  getConfigs,
  setDefaultDirectory,
}
