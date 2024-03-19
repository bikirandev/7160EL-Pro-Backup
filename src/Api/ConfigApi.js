const Datastore = require('nedb')
const dStoreSources = './Data/nedb_configs.db'

CONF_BACKUP_DIR = 'backupDir'

const getConfigs = async (ev, date) => {
  const db = new Datastore({ filename: dStoreSources, autoload: true })

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

  console.log('addBackupDir')
}
