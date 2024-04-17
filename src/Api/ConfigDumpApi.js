const {
  CONF_DUMP_MYSQL,
  CONF_DUMP_MSSQL,
  CONF_DUMP_PGSQL,
} = require('../Models/Configs/ConfigKeys')
const { updateDocument, DB_CONFIG } = require('../utils/PouchDbTools')

const setDumpPath = async (ev, data) => {
  console.log('Set Dump Path', data)
  // data.dumpType = 'mysql'
  // data.path = ''

  // DB Types
  const dumpTypes = [CONF_DUMP_MYSQL, CONF_DUMP_MSSQL, CONF_DUMP_PGSQL]

  // Validate path
  if (!data.path) {
    return { error: 1, message: 'Path is empty', data: null }
  }

  // Validate db type
  if (!dumpTypes.includes(data.dbType)) {
    return { error: 1, message: 'Invalid db type', data: null }
  }

  try {
    // Update on progress
    const updateSt = await updateDocument(DB_CONFIG, data.dumpType, { value: data.path })
    if (updateSt) {
      return { error: 0, message: 'Path updated', data: data }
    }

    return { error: 1, message: 'Failed to update path', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

const testDumpPath = async (ev, data) => {
  console.log('Set Dump Path', data)
  // data.dumpType = 'mysql'
  // data.path = ''

  // DB Types
  const dumpTypes = [CONF_DUMP_MYSQL, CONF_DUMP_MSSQL, CONF_DUMP_PGSQL]

  // Validate path
  if (!data.path) {
    return { error: 1, message: 'Path is empty', data: null }
  }

  // Validate db type
  if (!dumpTypes.includes(data.dbType)) {
    return { error: 1, message: 'Invalid db type', data: null }
  }

  try {
    // Update on progress
    // const updateSt = await updateDocument(DB_CONFIG, data.dumpType, { value: data.path })
    // if (updateSt) {
    //   return { error: 0, message: 'Path updated', data: data }
    // }

    console.log('Failed to test path', data)

    return { error: 1, message: 'Failed to update path', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

module.exports = {
  setDumpPath,
  testDumpPath,
}
