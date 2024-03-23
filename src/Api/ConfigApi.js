const { findAll } = require('../Models/Sources/SourcesDbOperation')

const CONF_BACKUP_DIR = 'backupDir'

const getConfigs = async (ev, data) => {
  const db = null

  console.log(ev, data, db)

  return {
    error: 0,
    message: 'Configs',
    data: {
      [CONF_BACKUP_DIR]: '',
    },
  }
}

const fixBackupDir = async (ev, data) => {
  const db = null

  console.log(ev, data, db)

  console.log('addBackupDir')
}

const getDefaultDirectory = async () => {
  const db = null

  const sources = await findAll(db, { type: 'default-directory' })

  return sources
}

module.exports = {
  getConfigs,
  fixBackupDir,
  getDefaultDirectory,
}
