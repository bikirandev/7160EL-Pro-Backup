const { exec } = require('child_process')

// Open file explorer function
const exploreDirectory = (ev, directoryPath) => {
  exec(`start "" "${directoryPath}"`, (err) => {
    if (err) {
      return {
        error: 1,
        message: 'Error on opening directory',
        data: null,
      }
    }

    return {
      error: 0,
      message: 'Directory opened',
      data: null,
    }
  })
}

module.exports = exploreDirectory
