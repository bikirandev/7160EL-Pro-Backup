const Execute = require('../../utils/Execute')

const mssqlExec = async (data, backupPath) => {
  console.log('MSSQL Exec:', data)
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  try {
    // SQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S localhost -E -Q "${sql}"`
    //console.log('command', command)

    // Execute
    const result = await Execute(command)
    const stdout = result?.data?.stdout || ''

    console.log(stdout)

    // Check if error
    if (stdout.includes('BACKUP DATABASE is terminating abnormally')) {
      const msg =
        stdout.split('\n')[1]?.replace('\r', '') || 'BACKUP DATABASE is terminating abnormally'
      return { error: 1, message: msg, data: [] }
    }

    return result
  } catch (e) {
    console.log('Error on MSSQL Connection', e)
    return { error: 1, message: 'Error on MSSQL Connection', data: [] }
  }
}

const mssqlConnect = async (data) => {
  console.log('MSSQL Connect:', data)
}

module.exports = {
  mssqlExec,
  mssqlConnect,
}
