const cron = require('node-cron')
const { evSendTaskStatus } = require('./Ev')
const { createErrorLog } = require('../Logs/LogCreate')
const { getNextRunTime } = require('../../utils/Cron')

const startTask = (id, fnName, pattern) => {
  // Schedule the job
  const task = cron.schedule(
    pattern,
    async () => {
      try {
        evSendTaskStatus(id, 'running')
        await fnName(null, id)
        evSendTaskStatus(id, 'done')
      } catch (err) {
        createErrorLog(`Task ${id} error: ${err.message}`)
        createErrorLog(JSON.stringify(err))
        evSendTaskStatus(id, 'error')
      }
    },
    {
      name: id,
      scheduled: false, // This prevents the job from being started automatically
      pattern: pattern,
    },
  )

  task.start()
}

const stopTask = async (id) => {
  const oTask = cron.getTasks().get(id)

  if (oTask) {
    const pattern = oTask.options.pattern
    var task = cron.schedule(pattern, () => {
      console.log('will execute every minute until stopped')
    })

    task.stop()
  }
}

const getTasksStatus = () => {
  const status = []

  cron.getTasks().forEach((task) => {
    const pattern = task.options.pattern // 30 * * * *

    console.log(task)

    status.push({
      id: task.options.name,
      running: !!task._scheduler.timeout,
      nextRun: getNextRunTime(pattern).unix(),
      timeRemaining: getNextRunTime(pattern).diff(new Date(), 'seconds'),
      pattern,
    })
  })

  console.log(status)

  return status
}

module.exports = {
  startTask,
  stopTask,
  getTasksStatus,
}
