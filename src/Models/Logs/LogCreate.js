const fs = require('fs')
const moment = require('moment')
const LOG_DIR_LOCAL = './Logs'
const LOG_DIR_REMOTE = 'logs'

const createLog = (logType, logText) => {
  const logFilename = `${LOG_DIR_LOCAL}/Log_${logType}_${moment().format('YYYY_MM_DD_HH')}.log`
  const logEntry = `${moment().format('YYYY-MM-DD HH:mm:ss')} - ${logText}\n`

  if (!fs.existsSync(LOG_DIR_LOCAL)) {
    fs.mkdirSync(LOG_DIR_LOCAL)
  }

  fs.openSync(logFilename, 'a')
  fs.appendFileSync(logFilename, logEntry)
}

const createErrorLog = (logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  createLog('Error', logText)
}

const createSuccessLog = (logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  createLog('Success', logText)
}

const createBackupLog = (sourceId, logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  console.log(`${sourceId} - ${logText}`)
  createLog('Backup', `${sourceId} - ${logText}`)
}

module.exports = {
  LOG_DIR_LOCAL,
  LOG_DIR_REMOTE,
  createErrorLog,
  createSuccessLog,
  createBackupLog,
}
