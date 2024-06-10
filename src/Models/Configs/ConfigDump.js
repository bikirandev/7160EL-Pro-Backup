const { exec } = require('child_process')

const dumpUtilities = {
  dumpPgsql: 'pg_dump.exe',
  dumpMysql: 'mysqldump.exe',
  dumpMssql: 'sqlcmd.exe',
}

const dumpCommands = {
  dumpPgsql: 'pg_dump',
  dumpMysql: 'mysqldump',
  dumpMssql: 'sqlcmd',
}

const replaceFileNameFromPath = (path, dumpType) => {
  // ex:'C:\Program Files\PostgreSQL\16\bin\sqlcmd.exe' => 'C:\Program Files\PostgreSQL\16\bin\sqlcmd.exe'
  const pathArr = path.split('\\') // Change '/' to '\\' for Windows paths
  pathArr.pop()
  pathArr.push(dumpUtilities[dumpType])
  return pathArr.join('\\') // Change '/' to '\\' for Windows paths
}

function scanDumpPathExistence(commandType, dumpType) {
  return new Promise((resolve) => {
    // const command = `dir /s /b "C:\\pg_dump.exe"`
    const command = `where ${commandType}"`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // reject({ error: 1, message: error.message, data: null })
        resolve({
          error: 1,
          message: error.message,
          data: null,
        })
        return
      }
      if (stderr) {
        // reject({ error: 1, message: stderr, data: null })
        resolve({
          error: 1,
          message: 'Error finding dump path',
          data: null,
        })
        return
      }
      const files = stdout.trim().split('\n')
      if (files.length > 0) {
        const pgDumpPath = files[0].trim()
        resolve({
          error: 0,
          message: 'Dump path found',
          data: { path: replaceFileNameFromPath(pgDumpPath, dumpType) },
        })
      } else {
        resolve({ error: 0, message: 'dump.exe not found', data: null })
      }
    })
  })
}

const testDumpPathExistence = async (commandType) => {
  let sqlType = {}
  for (const [key, value] of Object.entries(dumpCommands)) {
    sqlType[value] = key
  }

  const sql = sqlType[commandType]?.slice(4) || 'SQL'

  return new Promise((resolve) => {
    const command = `where ${commandType}"`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          error: 1,
          message: `${sql} dump path not found`,
          data: null,
        })
        return
      }
      if (stderr) {
        resolve({
          error: 1,
          message: 'Error finding dump path',
          data: null,
        })
        return
      }
      const files = stdout.trim().split('\n')
      if (files.length > 0) {
        const pgDumpPath = files[0].trim()
        resolve({
          error: 0,
          message: `${sql} Dump path found`,
          data: { path: pgDumpPath },
        })
      } else {
        resolve({ error: 0, message: 'dump.exe not found', data: null })
      }
    })
  })
}

module.exports = {
  scanDumpPathExistence,
  testDumpPathExistence,
  dumpUtilities,
  dumpCommands,
  replaceFileNameFromPath,
}
