const cron = require('node-cron')
const { evSendTaskStatus } = require('./Ev')

const addTask = (id, fnName, pattern = '* * * * *') => {
  // Schedule the job
  cron.schedule(
    pattern,
    async () => {
      evSendTaskStatus(id, 'running')
      await fnName(null, id)
      evSendTaskStatus(id, 'done')
    },
    {
      name: id,
      scheduled: false, // This prevents the job from being started automatically
    },
  )
}

const startTask = (id) => {
  const task = cron.getTasks().get(id)
  if (task) {
    task.start()
  }
}

const stopTask = async (id) => {
  const task = cron.getTasks().get(id)
  if (task) {
    await task.stop()
    evSendTaskStatus(id, 'stopped')
  }
}

const getTasksStatus = () => {
  const status = []

  cron.getTasks().forEach((task) => {
    status.push({
      id: task.options.name,
      running: !!task._scheduler.timeout,
    })
  })
  return status
}

module.exports = {
  addTask,
  startTask,
  stopTask,
  getTasksStatus,
}
