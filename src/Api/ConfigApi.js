const { setDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const { getAllDocuments, DB_CONFIG } = require('../utils/PouchDbTools')

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

module.exports = {
  getConfigs,
  setDefaultDirectory,
}
