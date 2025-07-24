// Example implementation for integrating auto-updater into your UI
// Add this to your main UI component

class UpdateManager {
  constructor() {
    this.updateStatus = null
    this.isUpdateAvailable = false
    this.isDownloading = false
    this.downloadProgress = 0
    
    this.initializeUpdater()
  }

  initializeUpdater() {
    // Listen for update status messages
    if (window.electronAPI && window.electronAPI.messageOn) {
      window.electronAPI.messageOn('updater-status', (event, status) => {
        this.handleUpdateStatus(status)
      })

      // Listen for auth token (existing functionality)
      window.electronAPI.messageOn('auth-token-received', (event, token) => {
        console.log('Auth token received:', token)
        // Handle auth token as needed
      })
    }
  }

  handleUpdateStatus(status) {
    console.log('Update status:', status)
    this.updateStatus = status

    // Parse different types of status messages
    if (status.includes('Update available')) {
      this.isUpdateAvailable = true
      this.showUpdateNotification('A new update is available and will be downloaded in the background.')
    } else if (status.includes('Download speed')) {
      this.isDownloading = true
      this.parseDownloadProgress(status)
    } else if (status.includes('Update downloaded')) {
      this.isDownloading = false
      this.isUpdateAvailable = false
      this.showUpdateReadyNotification()
    } else if (status.includes('Update not available')) {
      this.showNoUpdateNotification()
    } else if (status.includes('Error')) {
      this.showUpdateError(status)
    }

    // Update UI elements
    this.updateUI()
  }

  parseDownloadProgress(status) {
    // Extract percentage from status like "Download speed: 1234567 - Downloaded 45% (123456/789012)"
    const percentMatch = status.match(/Downloaded (\d+)%/)
    if (percentMatch) {
      this.downloadProgress = parseInt(percentMatch[1])
    }
  }

  async checkForUpdates() {
    try {
      if (window.electronAPI && window.electronAPI.checkForUpdates) {
        await window.electronAPI.checkForUpdates()
        this.showUpdateCheckNotification()
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
      this.showUpdateError('Failed to check for updates')
    }
  }

  async downloadUpdate() {
    try {
      if (window.electronAPI && window.electronAPI.downloadUpdate) {
        await window.electronAPI.downloadUpdate()
      }
    } catch (error) {
      console.error('Error downloading update:', error)
      this.showUpdateError('Failed to download update')
    }
  }

  // UI notification methods - customize these based on your UI framework
  showUpdateNotification(message) {
    // Example using a simple alert - replace with your notification system
    console.log('Update Notification:', message)
    
    // Example with a custom notification
    this.createNotification('Update Available', message, 'info')
  }

  showUpdateReadyNotification() {
    const message = 'Update has been downloaded and is ready to install. The app will restart to apply the update.'
    console.log('Update Ready:', message)
    
    this.createNotification('Update Ready', message, 'success', [
      {
        text: 'Restart Now',
        action: () => {
          // The app will restart automatically when user clicks restart in the system dialog
          console.log('User chose to restart for update')
        }
      },
      {
        text: 'Later',
        action: () => {
          console.log('User chose to update later')
        }
      }
    ])
  }

  showNoUpdateNotification() {
    const message = 'You are running the latest version.'
    console.log('No Update:', message)
    this.createNotification('No Updates', message, 'info')
  }

  showUpdateCheckNotification() {
    const message = 'Checking for updates...'
    console.log('Checking Updates:', message)
    this.createNotification('Checking for Updates', message, 'info')
  }

  showUpdateError(error) {
    console.error('Update Error:', error)
    this.createNotification('Update Error', error, 'error')
  }

  createNotification(title, message, type, actions = []) {
    // Customize this method based on your UI framework
    // This is a basic example
    
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
    
    // Example DOM manipulation (if using vanilla JS)
    if (typeof document !== 'undefined') {
      const notification = document.createElement('div')
      notification.className = `notification notification-${type}`
      notification.innerHTML = `
        <div class="notification-content">
          <h4>${title}</h4>
          <p>${message}</p>
          ${actions.map(action => `
            <button onclick="(${action.action.toString()})()" class="notification-button">
              ${action.text}
            </button>
          `).join('')}
        </div>
      `
      
      // Add to notification container
      const container = document.getElementById('notifications') || document.body
      container.appendChild(notification)
      
      // Auto-remove after 5 seconds if no actions
      if (actions.length === 0) {
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 5000)
      }
    }
  }

  updateUI() {
    // Update UI elements based on current state
    this.updateUpdateButton()
    this.updateProgressBar()
    this.updateStatusText()
  }

  updateUpdateButton() {
    const updateButton = document.getElementById('check-updates-btn')
    if (updateButton) {
      if (this.isDownloading) {
        updateButton.textContent = 'Downloading...'
        updateButton.disabled = true
      } else if (this.isUpdateAvailable) {
        updateButton.textContent = 'Update Available'
        updateButton.disabled = false
      } else {
        updateButton.textContent = 'Check for Updates'
        updateButton.disabled = false
      }
    }
  }

  updateProgressBar() {
    const progressBar = document.getElementById('update-progress')
    if (progressBar && this.isDownloading) {
      progressBar.style.display = 'block'
      progressBar.value = this.downloadProgress
    } else if (progressBar) {
      progressBar.style.display = 'none'
    }
  }

  updateStatusText() {
    const statusText = document.getElementById('update-status')
    if (statusText) {
      statusText.textContent = this.updateStatus || 'Ready'
    }
  }

  // Method to add update UI to existing page
  addUpdateUI(containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    const updateUI = document.createElement('div')
    updateUI.innerHTML = `
      <div class="update-section">
        <h3>App Updates</h3>
        <div class="update-controls">
          <button id="check-updates-btn" onclick="updateManager.checkForUpdates()">
            Check for Updates
          </button>
          <progress id="update-progress" style="display: none;" max="100" value="0"></progress>
          <p id="update-status">Ready</p>
        </div>
      </div>
      <style>
        .update-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .update-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
        #check-updates-btn {
          padding: 8px 16px;
          background: #007cba;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        #check-updates-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        #update-progress {
          width: 200px;
        }
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          max-width: 300px;
        }
        .notification-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .notification-success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .notification-error { background: #ffebee; border-left: 4px solid #f44336; }
        .notification-button {
          margin: 5px 5px 0 0;
          padding: 5px 10px;
          border: 1px solid #ccc;
          border-radius: 3px;
          cursor: pointer;
        }
      </style>
    `
    
    container.appendChild(updateUI)
  }
}

// Initialize the update manager
const updateManager = new UpdateManager()

// Export for global use
if (typeof window !== 'undefined') {
  window.updateManager = updateManager
}

// Example usage in your app:
// 1. Add this script to your HTML page
// 2. Call updateManager.addUpdateUI('your-container-id') to add the UI
// 3. Or create your own UI and call updateManager.checkForUpdates() manually
