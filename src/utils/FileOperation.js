const fs = require('fs')
const { ncp } = require('ncp')

const removeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true, force: true }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({ error: 0, message: 'Directory removed successfully.', data: null })
      }
    })
  })
}

// await fsp.rm(tempPath, { recursive: true, force: true })

const copyDir = (source, destination) => {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({ error: 0, message: 'Directory copied successfully.', data: null })
      }
    })
  })
}

const createDirForce = (path) => {
  return new Promise((resolve, reject) => {
    // check if directory already exists
    if (fs.existsSync(path)) {
      resolve({ error: 0, message: 'Directory already exists.', data: null })
    } else {
      fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve({ error: 0, message: 'Directory created successfully.', data: null })
        }
      })
    }
  })
}

module.exports = {
  removeDir,
  copyDir,
  createDirForce,
}
