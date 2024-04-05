const cleanBackups = async (source) => {
  const id = source._id
  const destinations = source.destinations

  console.log(id, destinations)
}

module.exports = {
  cleanBackups,
}
