const { dumpUtilities } = require('../Models/Configs/checkDumpFileExistence')
const {
  CONF_DUMP_MYSQL,
  CONF_DUMP_MSSQL,
  CONF_DUMP_PGSQL,
} = require('../Models/Configs/ConfigKeys')
const { isDirExists } = require('../utils/FileOperation')
const { updateDocument, DB_CONFIG, getDocument, createDocument } = require('../utils/PouchDbTools')

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
  if (!dumpTypes.includes(data.dumpType)) {
    return { error: 1, message: 'Invalid db type', data: null }
  }

  try {
    // Collect Ex Dump Path
    const exDumpPath = await getDocument(DB_CONFIG, data.dumpType)
    console.log('Ex Dump Path', exDumpPath)
    if (exDumpPath.error) {
      // Create New Data
      const createSt = await createDocument(DB_CONFIG, { _id: data.dumpType, value: data.path })
      console.log('Create Dump Path', createSt)
      if (createSt.error) {
        return { error: 1, message: 'Failed to update path', data: null }
      }
    } else {
      // Update Data
      const updateSt = await updateDocument(DB_CONFIG, data.dumpType, { value: data.path })
      console.log('Update Dump Path', updateSt)
      if (updateSt.error) {
        return { error: 1, message: 'Failed to update path', data: null }
      }
    }

    return { error: 0, message: 'Updated Successfully', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

const testDumpPath = async (ev, data) => {
  console.log('Set Dump Path', data)

  // check if the dump file exists in the directory
  const filePath = `${data.path.replace(/\\[^\\]*$/, '')}\\${dumpUtilities?.[data?.dumpType]}`
  // DB Types
  const dumpTypes = [CONF_DUMP_MYSQL, CONF_DUMP_MSSQL, CONF_DUMP_PGSQL]

  // Validate path
  if (!data.path) {
    return { error: 1, message: 'Path is empty', data: null }
  }

  // Validate db type
  if (!dumpTypes.includes(data.dumpType)) {
    return { error: 1, message: 'Invalid db type', data: null }
  }

  try {
    const isDirExist = await isDirExists(filePath)
    if (isDirExist.error) {
      return { error: 1, message: 'Directory not exists', data: null }
    }

    return { error: 0, message: 'Dump file found', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

module.exports = {
  setDumpPath,
  testDumpPath,
}
