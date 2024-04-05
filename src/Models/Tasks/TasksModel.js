const { createErrorLog } = require('../Logs/LogCreate')
const { evSendTaskStatus } = require('./Ev')
const { getNextRunTime } = require('../../utils/Cron')
const moment = require('moment')
const { forceBackup } = require('../Backup/BackupForce')

const tasks = []
let isTaskRunning = null

const executeTask = () => {
  for (const task of tasks) {
    const nextRun = getNextRunTime(task.frequencyPattern).unix() - 1
    const now = moment().unix()
    const def = nextRun - now
    console.log(
      'Task: ',
      task._id,
      getNextRunTime(task.frequencyPattern).unix(),
      moment().unix(),
      def,
    )
    if (nextRun !== now) {
      continue
    }

    const id = task._id
    try {
      evSendTaskStatus(id, 'running')
      forceBackup(null, id)
      evSendTaskStatus(id, 'done')
    } catch (err) {
      createErrorLog(`Task ${id} error: ${err.message}`)
      createErrorLog(JSON.stringify(err))
      evSendTaskStatus(id, 'error')
    }
  }
}

const startTask = () => {
  if (isTaskRunning) {
    return
  }

  isTaskRunning = setInterval(executeTask, 1000)
}

const stopTask = () => {
  // clear timeout
  clearInterval(isTaskRunning)
  isTaskRunning = null
}

const addTask = (source) => {
  if (tasks.find((task) => task._id === source._id)) {
    return
  }
  tasks.push(source)
}

const removeTask = (source) => {
  console.log('Removing Task: ', source)
  const index = tasks.findIndex((task) => task._id === source._id)
  tasks.splice(index, 1)
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
  restartTask,
  addTask,
  removeTask,
  getTasks,
  getTasksStatus,
}
