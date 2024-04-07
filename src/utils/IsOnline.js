const checkOnline = async () => {
  const gApi = 'https://www.googleapis.com/oauth2/v1/certs'
  try {
    const response = await fetch(gApi)
    console.log(response)
    return response.status === 200
  } catch (err) {
    return false
  }
}

module.exports = { checkOnline }
