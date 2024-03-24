const Execute = require('../../utils/Execute')
const mssql = require('mssql')

const mssqlWinExec = async (data, backupPath) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'exec') {
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

    if (stdout.includes('Incorrect syntax near the keyword')) {
      const msg = stdout.split('\n')[1]?.replace('\r', '') || 'Incorrect syntax near the keyword'
      return { error: 1, message: msg, data: [] }
    }

    return result
  } catch (e) {
    console.log('Error on MSSQL Connection', e)
    return { error: 1, message: 'Error on MSSQL Connection', data: [] }
  }
}

const mssqlWinConnect = async (data, backupPath) => {
  const database = data.databaseOrPath
  console.log('backupPath', backupPath)

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-connection') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  mssql.connect({
    server: 'localhost',
    database: database,
    options: {
      trustedConnection: true,
    },
  })

  try {
    const pool = await mssql.connect()
    const result = await pool.request().query('SELECT 1')
    console.log('result', result)
    return { error: 0, message: 'Connected', data: result }
  } catch (e) {
    console.log('Error on MSSQL Connection', e)
    return { error: 1, message: 'Error on MSSQL Connection', data: [] }
  }
}

const mssqlWinDemo = async (data, backupPath) => {
  const database = data.databaseOrPath
  console.log('database', database)
  console.log('backupPath', backupPath)

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-demo') {
    return { error: 0, message: 'Skipped', data: [] }
  }

  return { error: 0, message: 'Demo', data: [] }
}
module.exports = {
  mssqlWinExec,
  mssqlWinConnect,
  mssqlWinDemo,
}
