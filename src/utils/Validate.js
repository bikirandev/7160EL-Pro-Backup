const validateAll = (values = []) => {
  for (let i = 0; i < values.length; i++) {
    const data = values[i]
    if (data.error !== 0) {
      return data
    }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

module.exports = {
  validateAll,
}
