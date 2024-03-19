const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const { backupMssql } = require('./src/Models/BackupLocal/BackupLocal')

const backupPath = 'C:'

function getDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}_${('0' + d.getHours()).slice(-2)}-${('0' + d.getMinutes()).slice(-2)}-${('0' + d.getSeconds()).slice(-2)}`
}

// eslint-disable-next-line no-unused-vars
function backup() {
  const fileName = `database_backup_${getDateString()}.bak`
  const filePath = path.join(backupPath, fileName)
  const command = `sqlcmd -S localhost -E -Q "BACKUP DATABASE Bishojit TO DISK='${filePath}'"`
  console.log('command', command)

  // , stdout, stderr
  exec(command, (error) => {
    if (error) {
      console.error(`Error backing up database: ${error}`)
    } else {
      //console.log(`stdout: ${stdout}`)
      //console.log(`Database backup saved to ${backupPath}\\${fileName}`)

      // is file exist
      if (fs.existsSync(filePath)) {
        console.log('Done')
      } else {
        console.log('Error')
      }
    }
  })
}

//backup()

backupMssql({ database: 'Bishojit', localDir: '/Users/bishojit/Downloads/' })
