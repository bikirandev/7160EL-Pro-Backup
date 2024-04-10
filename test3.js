const { restoreFromRemote } = require('./src/Api/ConfigApi')

restoreFromRemote(null, {})
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })

// const { cleanupBackups } = require('./src/Api/SourceBackupApi')

// cleanupBackups(null, { sourceId: '5235797dcd6aa45a76b0256a5d31b098' })
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
