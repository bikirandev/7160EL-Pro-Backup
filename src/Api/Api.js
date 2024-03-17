const { addSourceNew } = require('./SourcesApi')

const api = async (ev, data) => {
  const id = data.id
  const rKey = data.rKey

  const nData = { ...data }
  delete nData.id, nData.rKey

  console.log('api-ev', ev)
  console.log('api', data)

  const result = await addSourceNew(data)

  ev.reply('cReceiver', { id, rKey, result })
}

// Export the function
module.exports = { api }
