const exec = require('child_process').exec

const Execute = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      } else {
        resolve({ error, stdout, stderr })
      }
    })
  })
}

module.exports = Execute
