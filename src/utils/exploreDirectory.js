const { exec } = require('child_process')

// Open file explorer function
const exploreDirectory = (ev,directoryPath) => {

  exec(`start "" "${directoryPath}"`, (err) => {
    if (err) {
      console.error(err)
      return
    }
    // console.log('File explorer opened')
  })
}


module.exports = exploreDirectory
