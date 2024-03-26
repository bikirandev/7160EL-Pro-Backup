const cron = require('node-cron')

const jobs = []

const addTask = (id, fnName) => {
  // Schedule the task
  const job = cron.schedule(
    `0 * * * *`,
    () => {
      console.log('Running ID: ' + id + ' || ' + new Date().toISOString())
      fnName(null, id)
    },
    {
      name: id,
      scheduled: false, // This prevents the task from being started automatically
      status: 'stopped',
    },
  )

  job.id = id
  console.log('Add id:', id)

  jobs.push(job)
}

const startTask = (id) => {
  const job = jobs.find((job) => job.id === id)
  if (job) {
    console.log('Start id:', id)
    job.start()
    job.options.status = 'running'
  }
}

const stopTask = (id) => {
  const task = cron.getTasks()[id]
  if (task) {
    console.log('Stop id:', id)
    task.stop()
    task.options.status = 'stopped'
  }
}

const removeTask = (id) => {
  const task = cron.getTasks()[id]
  if (task) {
    console.log('Remove id:', id)
    task.destroy()
    jobs.splice(jobs.indexOf(task), 1)
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
