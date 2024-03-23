const mssql = require('mssql')

const validateMssqlWin = (dbName) => {
  // mssql find db name, windows authentication
  const config = {
    server: 'localhost',
    database: dbName,
    options: {
      trustedConnection: true,
    },
  }

  return new Promise((resolve, reject) => {
    mssql.connect(config, (err) => {
      console.log(err)
      if (err) {
        reject('Error connecting to the database')
      } else {
        resolve({ error: 0, message: 'Connection to the database successful', data: [] })
      }
    })
  })
}

// Export
module.exports = {
  validateMssqlWin,
}
