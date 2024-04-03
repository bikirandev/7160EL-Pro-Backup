const { addTask, stopTask, getTasksStatus } = require('../Models/Tasks/TasksModel')
const { getDocument, DB_SOURCE } = require('../utils/PouchDbTools')

// backup create and backup start
const scheduleStart = async (ev, id) => {
  // Collect the backup source
  const sourceInfo = await getDocument(DB_SOURCE, id)

  // Creating a new task
  addTask(sourceInfo)

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Started', data: st }
}

// backup destroy and backup stop
const scheduleStop = async (ev, id) => {
  // Collect the backup source
  const sourceInfo = await getDocument(DB_SOURCE, id)

  // Remove the task
  stopTask(sourceInfo)

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Stopped', data: st }
}

module.exports = {
  scheduleStart,
  scheduleStop,
}
