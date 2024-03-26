const {
  addTask,
  startTask,
  getRunningTasks,
  stopTask,
  removeTask,
} = require('../Models/Tasks/TasksModel')
const { forceBackup } = require('./SourceBackupApi')

// backup create and backup start
const scheduleStart = async (ev, id) => {
  addTask(id, forceBackup)
  startTask(id)

  const st = getRunningTasks()
  console.log('Running Tasks:', st)
}

// backup destroy and backup stop
const scheduleStop = async (ev, id) => {
  stopTask(id)
  removeTask(id)

  const st = getRunningTasks()
  console.log('Running Tasks:', st)
}

module.exports = {
  scheduleStart,
  scheduleStop,
}
