const { addSourceNew } = require('./SourcesApi')

const api = async (ev, data) => {
  const id = data.id
  const rKey = data.rKey
  const nData = data.data

  console.log('api-ev', ev)
  console.log('api', data)

  const result = await addSourceNew(nData)

  ev.reply('cReceiver', { id, rKey, result })
}

// Export the function
module.exports = { api }
