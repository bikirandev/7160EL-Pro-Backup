const exec = require('child_process').exec

const Execute = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

module.exports = Execute
