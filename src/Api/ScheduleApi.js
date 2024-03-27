const { addTask, startTask, stopTask, getTasksStatus } = require('../Models/Tasks/TasksModel')
const { forceBackup } = require('./SourceBackupApi')

// backup create and backup start
const scheduleStart = async (ev, id) => {
  addTask(id, forceBackup)
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
