//const exec = require('child_process').exec
//const fs = require('fs')
const path = require('path')
const Execute = require('../../utils/Execute')

function getDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}_${('0' + d.getHours()).slice(-2)}-${('0' + d.getMinutes()).slice(-2)}-${('0' + d.getSeconds()).slice(-2)}`
}

const backupMssql = async ({ database, localDir }) => {
  try {
    // FS Operation
    const filename = `mssql_${database}_${getDateString()}.bak`

    const backupPath = path.join(localDir, filename)

    // SQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S localhost -E -Q "${sql}"`
    //console.log('command', command)

    // Execute
    const result = await Execute(command)
    console.log(result)

    console.log('++')
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  backupMssql,
}
