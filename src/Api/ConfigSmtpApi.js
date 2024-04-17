const nodemailer = require('nodemailer')
const { getSmtpData, setSmtpData } = require('../Models/Configs/ConfigSmtp')

const setSMTPConfig = async (ev, data) => {
  console.log(ev, data)
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
    // Collect Config Data
    const smtpData = await setSmtpData(data.hostname, data.port, data.username, data.password)
    if (smtpData.error) {
      return { error: 1, message: 'Error on setting SMTP Config', data: null }
    }

    return { error: 0, message: 'SMTP Config set successfully', data: null }
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
  // data.TestEmail = ''

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
    const smtpData = await getSmtpData()
    if (smtpData.error) {
      return { error: 1, message: 'Error on getting SMTP Config', data: null }
    }

    // Test SMTP Config
    const transporter = nodemailer.createTransport({
      host: smtpData.data.hostname,
      port: smtpData.data.port,
      secure: true,
      auth: {
        user: smtpData.data.username,
        pass: smtpData.data.password,
      },
    })

    // Send Test Email
    const mailOptions = {
      from: smtpData.data.username,
      to: data.TestEmail,
      subject: 'Test Email',
      text: 'This is a test email from Backup Manager',
    }

    // Send Email
    const info = await transporter.sendMail(mailOptions)

    console.log('Testing SMTP Config...', info)

    return { error: 0, message: 'An email sent to ' + data.TestEmail, data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on setting SMTP Config', data: null }
  }
}

module.exports = {
  setSMTPConfig,
  testSMTPConfig,
}
