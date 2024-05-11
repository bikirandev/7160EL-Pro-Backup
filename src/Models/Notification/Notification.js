const { Notification } = require('electron')

const showNotification = (body) => {
  const notification = new Notification({
    title: 'Pro Backup',
    body: body,
    icon: './src/assets/backup-pro-logo.png',
  })
  notification.show()

  notification.on('click', () => {
    console.log('Notification clicked!')
  })

  // notification.on('show', () => console.log('Notification shown!'))
  // notification.on('close', () => console.log('Notification closed!'))
  // notification.on('reply', () => console.log('Notification replied!'))

  return notification
}

module.exports = { showNotification }
