const fsp = require('fs').promises
const path = require('path')
const { filesInfo } = require('../utils/FileOperation')

const getLogFiles = async () => {
  try {
    const logDir = './Logs'

    // Read files with  time created
    const files = await fsp.readdir(logDir)
    const filesFullPath = files.map((file) => path.join(logDir, file))
    const fInfo = await filesInfo(filesFullPath)

    return { error: 0, message: 'List of Log Files', data: fInfo }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Log Files', data: null }
  }
}

module.exports = {
  getLogFiles,
}
