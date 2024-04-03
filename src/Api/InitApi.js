const { setEv } = require('../Models/Tasks/Ev')
const { getTasksStatus, restartTask } = require('../Models/Tasks/TasksModel')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')
const { forceBackup } = require('./SourceBackupApi')

const init = async (ev) => {
  // EV
  setEv(ev)

  try {
    const data = await getAllDocuments(DB_SOURCE)

    // Generate random number between 0 and 59
    const random = Math.floor(Math.random() * 60)

    //--Apply Autostart
    data.forEach((source) => {
      if (source.autostart) {
        restartTask(source._id, forceBackup, source.frequencyPattern || `${random} * * * *`)
      }
    })

    const tasks = getTasksStatus()
    console.log(tasks)

    return { error: 0, message: 'Application Init Success', data: data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  init,
}
