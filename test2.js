const { getRecentBackups } = require('./src/Models/GoogleBackup/GoogleBackup')
const { destinations } = require('./Default/DefaultValue')

const abc = async () => {
  const aaa = await getRecentBackups(destinations[0])
  return aaa
}

console.log(abc())
