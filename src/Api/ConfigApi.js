const Datastore = require('nedb')
const dStoreSources = './Data/nedb_configs.db'

const CONF_BACKUP_DIR = 'backupDir'

const getConfigs = async (ev, data) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

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
  const db = new Datastore({ filename: dStoreSources, autoload: true })

  console.log(ev, data, db)

  console.log('addBackupDir')
}

module.exports = {
  getConfigs,
  fixBackupDir,
}
