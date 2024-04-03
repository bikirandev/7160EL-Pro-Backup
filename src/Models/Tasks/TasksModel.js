const { forceBackup } = require('../../Api/SourceBackupApi')
const { createErrorLog } = require('../Logs/LogCreate')
const { evSendTaskStatus } = require('./Ev')
const { getNextRunTime } = require('../../utils/Cron')
const moment = require('moment')

const tasks = []
let isTaskRunning = false

const executeTask = async () => {
  console.log('\n')
  for (const task of tasks) {
    console.log('Task Executing', getNextRunTime(task.frequencyPattern).unix(), moment().unix())
    if (getNextRunTime(task.frequencyPattern).unix() !== moment().unix()) {
      continue
    }

    console.log('Task Running: ' + task._id)
    const id = task._id
    try {
      evSendTaskStatus(id, 'running')
      await forceBackup(null, id)
      evSendTaskStatus(id, 'done')
    } catch (err) {
      createErrorLog(`Task ${id} error: ${err.message}`)
      createErrorLog(JSON.stringify(err))
      evSendTaskStatus(id, 'error')
    }
  }
}

const startTask = () => {
  console.log(isTaskRunning)
  if (isTaskRunning) {
    return
  }

  setInterval(executeTask, 1000)
  isTaskRunning = true
}

const stopTask = () => {
  // clear timeout
  clearInterval(executeTask)
  isTaskRunning = false
}

const addTask = (source, restart = true) => {
  if (tasks.find((task) => task._id === source._id)) {
    return
  }
  tasks.push(source)

  // Restart the task
  if (restart) {
    stopTask()
    startTask()
  }
}

const removeTask = (source, restart = true) => {
  const index = tasks.indexOf(source)
  tasks.splice(index, 1)

  // Restart the task
  if (restart) {
    stopTask()
    startTask()
  }
}

const restartTask = () => {
  stopTask()
  startTask()
}

const getTasks = () => {
  return tasks
}

const getTasksStatus = () => {
  return tasks.map((task) => {
    return {
      id: task._id,
      running: true,
      nextRun: getNextRunTime(task.frequencyPattern).unix(),
      timeRemaining: getNextRunTime(task.frequencyPattern).diff(new Date(), 'seconds'),
      pattern: task.frequencyPattern,
    }
  })
}

module.exports = {
  startTask,
  stopTask,
  restartTask,
  addTask,
  removeTask,
  getTasks,
  getTasksStatus,
}
