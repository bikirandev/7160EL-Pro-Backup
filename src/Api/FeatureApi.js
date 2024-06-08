const nodemailer = require('nodemailer')
const { getSmtpData } = require('../Models/Configs/ConfigSmtp')

const addFeatureRequest = async (ev, data) => {
  try {
    //check if data is empty or not
    if (!data.fullName) {
      return { error: 1, message: 'Full Name is required', data: null }
    }
    if (!data.email) {
      return { error: 1, message: 'Email is required', data: null }
    }
    if (!data.title) {
      return { error: 1, message: 'Title is required', data: null }
    }
    if (!data.description) {
      return { error: 1, message: 'Description is required', data: null }
    }
    // if(!data.reason){
    //     return { error: 1, message: 'Reason is required', data: null }
    // }
    // if(!data.priority){
    //     return { error: 1, message: 'Priority is required', data: null }
    // }
    if (!data.category) {
      return { error: 1, message: 'Category is required', data: null }
    }

    // Get SMTP Config
    const response = await getSmtpData()
    //check if there is an error
    if (response.error) {
      return { error: 1, message: 'Error on getting SMTP Config', data: null }
    }

    // Get SMTP Data
    const smtpData = response?.data?.value

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: smtpData.hostname,
      port: smtpData.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: smtpData.username,
        pass: smtpData.password,
      },
    })

    // Email Body
    const emailBody = `
    **Feature Request Details**

    - **Full Name:** ${data.fullName || '[Empty]'}
    - **Email:** ${data.email || '[Empty]'}
    - **Title:** ${data.title || '[Empty]'}
    - **Description:** ${data.description || '[Empty]'}
    - **Reason:** ${data.reason || '[Empty]'}
    - **Priority:** ${data.priority || '[Empty]'}
    - **Category:** ${data.category || '[Empty]'}
    `

    // Recipient Email
    const mailTo = 'info@bikiran.com'

    // Mail Options
    const mailOptions = {
      from: `Pro Backup <${data.username}>`,
      to: mailTo,
      subject: 'Feature Request',
      text: emailBody,
    }

    // // Send Email
    const result = await transporter.sendMail(mailOptions)
    console.log(result)

    // Return Success
    return {
      error: 0,
      message: 'Feature Request sent successfully',
      data: null,
    }
  } catch (err) {
    console.log(err)
    // Return Error
    return {
      error: 1,
      message: 'Error sending Feature Request',
      data: null,
    }
  }
}

module.exports = { addFeatureRequest }
