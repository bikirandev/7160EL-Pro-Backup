const setSMTPConfig = async (ev, data) => {
  // data.hostname = ''
  // data.port = ''
  // data.username = ''
  // data.password = ''

  if (!data.hostname) {
    return { error: 1, message: 'Hostname is required', data: null }
  }

  if (!data.port) {
    return { error: 1, message: 'Port is required', data: null }
  }

  if (!data.username) {
    return { error: 1, message: 'Username is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  try {
    // Log
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on setting SMTP Config', data: null }
  }
}

const testSMTPConfig = async (ev, data) => {
  // data.hostname = ''
  // data.port = ''
  // data.username = ''
  // data.password = ''

  if (!data.hostname) {
    return { error: 1, message: 'Hostname is required', data: null }
  }

  if (!data.port) {
    return { error: 1, message: 'Port is required', data: null }
  }

  if (!data.username) {
    return { error: 1, message: 'Username is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  try {
    // Log
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on setting SMTP Config', data: null }
  }
}

module.exports = {
  setSMTPConfig,
  testSMTPConfig,
}
