const exec = require('child_process').exec

const ExecuteMssql = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('error', error)
        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

const ExecutePgsql = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const message = error.message.split('\n')[1] // pg_dump: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  password authentication failed for user "postgres"
        if (message.includes('password authentication failed for user')) {
          const user = command.split('-U')[1].split(' ')[0]
          resolve({
            error: 1,
            message: `Password authentication failed for user "${user}"`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: could not translate host name "localhost" to address: Unknown host
        if (message.includes('could not translate host name')) {
          const host = command.split('-h')[1].split(' ')[0]
          resolve({
            error: 1,
            message: `Could not translate host name "${host}" to address: Unknown host`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  database "db_name" does not exist
        if (message.includes('database does not exist')) {
          const database = command.split('-d')[1].split(' ')[0]
          resolve({
            error: 1,
            message: `Database "${database}" does not exist`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: connection to server at "localhost" (::1), port 22 failed: Connection refused (0x0000274D/10061)
        if (message.includes('Connection refused')) {
          const port = command.split('-p')[1].split(' ')[0]
          resolve({
            error: 1,
            message: `Connection refused on port ${port}`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: invalid port number: "543222"
        if (message.includes('invalid port number')) {
          const port = command.split('-p')[1].split(' ')[0]
          resolve({
            error: 1,
            message: `Invalid port number "${port}"`,
            data: { error, stdout, stderr },
          })
        }

        // message = The system cannot find the path specified.
        if (message.includes('The system cannot find the path specified')) {
          const dumpPath = command.split('&&')[1].split('>')[0].trim()
          resolve({
            error: 1,
            message: `The system cannot find the path specified: ${dumpPath}`,
            data: { error, stdout, stderr },
          })
        }

        // message = Access is denied
        if (message.includes('Access is denied')) {
          const backupPath = command.split('>')[1].trim()
          resolve({
            error: 1,
            message: `Access is denied: ${backupPath}`,
            data: { error, stdout, stderr },
          })
        }

        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

module.exports = {
  ExecuteMssql,
  ExecutePgsql,
}
