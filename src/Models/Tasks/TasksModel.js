const cron = require('node-cron')

const jobs = []

const addTask = (id, fnName) => {
  // Schedule the task
  const job = cron.schedule(
    '* * * * *',
    () => {
      console.log('Running: ' + new Date().toISOString())
      fnName(null, id)
    },
    {
      name: id,
      scheduled: false, // This prevents the task from being started automatically
      status: 'stopped',
    },
  )

  job.id = id

  jobs.push(job)
}

const startTask = (id) => {
  const job = jobs.find((job) => job.id === id)
  if (job) {
    job.options.status = 'running'
    job.start()
  }
}

const stopTask = (id) => {
  const task = cron.getTasks()[id]
  if (task) {
    task.options.status = 'stopped'
    task.stop()
  }
}

const removeTask = (id) => {
  const task = cron.getTasks()[id]
  if (task) {
    task.destroy()
  }
}

const getRunningTasks = () => {
  const runningTasks = jobs.filter((job) => job.options.status === 'running')

  return runningTasks
}

module.exports = {
  addTask,
  startTask,
  stopTask,
  removeTask,
  getRunningTasks,
}
