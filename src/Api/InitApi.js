const { setEv } = require('../Models/Tasks/Ev')
const { addTask, startTask } = require('../Models/Tasks/TasksModel')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')
const { forceBackup } = require('./SourceBackupApi')

const init = async (ev) => {
  // EV
  setEv(ev)

  try {
    const data = await getAllDocuments(DB_SOURCE)
    console.log('data', data)

    // Generate random number between 0 and 59
    const random = Math.floor(Math.random() * 60)

    //--Apply Autostart
    data.forEach((source) => {
      if (source.autostart) {
        addTask(source._id, forceBackup, source.frequencyPattern || `${random} * * * *`)
        startTask(source._id)
      }
    })

    return { error: 0, message: 'Application Init Success', data: data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: [] }
  }
}

module.exports = {
  init,
}
