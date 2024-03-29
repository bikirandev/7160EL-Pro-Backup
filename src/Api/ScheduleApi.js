const { addTask, startTask, stopTask, getTasksStatus } = require('../Models/Tasks/TasksModel')
const { getDocument, DB_SOURCE } = require('../utils/PouchDbTools')
const { forceBackup } = require('./SourceBackupApi')

// backup create and backup start
const scheduleStart = async (ev, id) => {
  // Collect the backup source
  const sourceInfo = await getDocument(DB_SOURCE, id)
  console.log('sourceInfo', sourceInfo)

  // generate random number between 0 and 59
  const random = Math.floor(Math.random() * 60)

  // Creating a new task
  addTask(id, forceBackup, sourceInfo.frequencyPattern || `${random} * * * *`)

  // Start the task
  startTask(id)

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Started', data: st }
}

// backup destroy and backup stop
const scheduleStop = async (ev, id) => {
  stopTask(id)

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Stopped', data: st }
}

module.exports = {
  scheduleStart,
  scheduleStop,
}
