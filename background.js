// background.js

const { showNotification } = require('./src/Models/Notification/Notification')

// Your background task logic
setInterval(() => {
  console.log('Background task running...')
  showNotification('Background task running...')
}, 5000) // Example: Run every 2 seconds
