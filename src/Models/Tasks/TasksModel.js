const cron = require('node-cron')

const addTask = (id, fnName) => {
  // Schedule the job
  cron.schedule(
    `0 * * * *`,
    () => {
      fnName(null, id)
    },
    {
      name: id,
      scheduled: false, // This prevents the job from being started automatically
    },
  )

  // Schedule the job
  cron.schedule(
    `0 * * * *`,
    () => {
      console.log('Task 2')
    },
    {
      name: id + '2',
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

const stopTask = (id) => {
  const task = cron.getTasks().get(id)
  if (task) {
    task.stop()
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
