const { fixAppId, getAppId } = require('../Models/Configs/ConfigAppId')
const { setEv } = require('../Models/Tasks/Ev')
const { addTask, restartTask } = require('../Models/Tasks/TasksModel')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')

const init = async (ev) => {
  // EV
  setEv(ev)

  try {
    // AppID
    await fixAppId()
    const appId = await getAppId()

    // Sources
    const sources = await getAllDocuments(DB_SOURCE)

    //--Apply Autostart
    sources.forEach((source) => {
      if (source.autostart) {
        addTask(source, false)
      }
    })

    restartTask()

    return {
      error: 0,
      message: 'Application Init Success',
      data: {
        appId: appId.data,
      },
    }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  init,
}
