const { destinations } = require('../utils/DefaultValue')

const getDestinations = async () => {
  return { error: 0, message: 'Success', data: destinations }
}

const addDestination = () => {}

const updateDestination = () => {}

const deleteDestination = () => {}

module.exports = {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
}
