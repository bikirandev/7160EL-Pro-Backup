const { setEv } = require('../Models/Tasks/Ev')
const { getTasksStatus, addTask, restartTask } = require('../Models/Tasks/TasksModel')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')

const init = async (ev) => {
  // EV
  setEv(ev)

  try {
    const data = await getAllDocuments(DB_SOURCE)

    //--Apply Autostart
    data.forEach((source) => {
      if (source.autostart) {
        console.log('Autostart: ' + source._id)
        addTask(source, false)
      }
    })
    restartTask()

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
