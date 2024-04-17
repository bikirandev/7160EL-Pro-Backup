const setDumpPath = async (ev, data) => {
  console.log('Set Dump Path', data)
}

const testDumpPath = async (ev, data) => {
  console.log('Test Dump Path', data)
}

module.exports = {
  setDumpPath,
  testDumpPath,
}
