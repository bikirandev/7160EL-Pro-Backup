const fsp = require('fs').promises
const path = require('path')
const { filesInfo, isDirExists, isFileExists } = require('../utils/FileOperation')

const getLogFiles = async (ev, data) => {
  console.log('getLogFiles', data)
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

const downloadLogFile = async (ev, data) => {
  console.log('downloadLogFile', data)
  // data.dirPath = '';
  // data.file = '';
  try {
    // check is dir exists
    const isDirExist = await isDirExists(data.dirPath)
    if (isDirExist.error) {
      return { error: 1, message: 'Directory not exists', data: null }
    }

    // check is file exists
    const isFileExist = await isFileExists(data.file)
    if (isFileExist.error) {
      return { error: 1, message: 'File not exists', data: null }
    }

    // copy file to destination
    const destFile = path.join(data.dirPath, path.basename(data.file))
    await fsp.copyFile(data.file, destFile)

    return { error: 0, message: 'File downloaded successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Log File', data: null }
  }
}

module.exports = {
  getLogFiles,
  downloadLogFile,
}
