#!/bin/bash

# Development helper for testing auto-updater UI
# Simulates update events for testing purposes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Auto-Updater Development Testing${NC}"
echo "====================================="

# Check if the app is running
echo -e "${YELLOW}📱 This script helps test auto-updater UI in development${NC}"
echo ""

# Create a test HTML file to demonstrate the updater UI
cat > test-updater-ui.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Updater Test UI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .update-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fafafa;
        }
        .update-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        button {
            padding: 8px 16px;
            background: #007cba;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #005a87;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        #update-progress {
            width: 300px;
            height: 20px;
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
            transition: all 0.3s ease;
        }
        .notification-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .notification-success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .notification-error { background: #ffebee; border-left: 4px solid #f44336; }
        .notification-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .test-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin: 10px 0;
        }
        .test-buttons button {
            background: #6c757d;
            font-size: 12px;
            padding: 6px 12px;
        }
        .code-block {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Auto-Updater Test Interface</h1>
        <p>This page simulates the auto-updater functionality for development and testing.</p>

        <div class="update-section">
            <h3>App Updates</h3>
            <div class="update-controls">
                <button id="check-updates-btn" onclick="testCheckForUpdates()">
                    Check for Updates
                </button>
                <progress id="update-progress" style="display: none;" max="100" value="0"></progress>
                <p id="update-status">Ready</p>
            </div>

            <div class="test-buttons">
                <button onclick="simulateUpdateAvailable()">Simulate: Update Available</button>
                <button onclick="simulateDownloading()">Simulate: Downloading</button>
                <button onclick="simulateDownloaded()">Simulate: Download Complete</button>
                <button onclick="simulateError()">Simulate: Error</button>
                <button onclick="simulateNoUpdate()">Simulate: No Update</button>
            </div>
        </div>

        <div class="update-section">
            <h3>Integration Code</h3>
            <p>To integrate this into your Electron app, add the UpdaterUI.js script:</p>
            <div class="code-block">
// In your renderer process (HTML page)
&lt;script src="src/utils/UpdaterUI.js">&lt;/script>
&lt;script>
  // Initialize the update manager
  const updateManager = new UpdateManager();
  
  // Add update UI to your page
  updateManager.addUpdateUI('your-container-id');
&lt;/script>
            </div>
        </div>

        <div class="update-section">
            <h3>Electron Main Process Integration</h3>
            <div class="code-block">
// In your main.js (already implemented)
const AutoUpdater = require('./src/utils/AutoUpdater');

app.on('ready', () => {
  // ... other initialization code
  
  if (app.isPackaged) {
    autoUpdater = new AutoUpdater(mainWindow);
  }
});
            </div>
        </div>
    </div>

    <script>
        // Mock window.electronAPI for testing
        window.electronAPI = {
            checkForUpdates: () => {
                console.log('Mock: Checking for updates...');
                return Promise.resolve();
            },
            downloadUpdate: () => {
                console.log('Mock: Downloading update...');
                return Promise.resolve();
            },
            messageOn: (event, callback) => {
                console.log('Mock: Listening for', event);
                window.mockCallback = callback;
            }
        };

        // Simple UpdateManager for testing
        class TestUpdateManager {
            constructor() {
                this.updateStatus = 'Ready';
                this.isUpdateAvailable = false;
                this.isDownloading = false;
                this.downloadProgress = 0;
            }

            handleUpdateStatus(status) {
                console.log('Update status:', status);
                this.updateStatus = status;

                if (status.includes('Update available')) {
                    this.isUpdateAvailable = true;
                    this.showNotification('Update Available', 'A new update is available and will be downloaded in the background.', 'info');
                } else if (status.includes('Download speed')) {
                    this.isDownloading = true;
                    this.parseDownloadProgress(status);
                } else if (status.includes('Update downloaded')) {
                    this.isDownloading = false;
                    this.isUpdateAvailable = false;
                    this.showNotification('Update Ready', 'Update has been downloaded and is ready to install.', 'success');
                } else if (status.includes('Update not available')) {
                    this.showNotification('No Updates', 'You are running the latest version.', 'info');
                } else if (status.includes('Error')) {
                    this.showNotification('Update Error', status, 'error');
                }

                this.updateUI();
            }

            parseDownloadProgress(status) {
                const percentMatch = status.match(/Downloaded (\d+)%/);
                if (percentMatch) {
                    this.downloadProgress = parseInt(percentMatch[1]);
                }
            }

            showNotification(title, message, type) {
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <h4>${title}</h4>
                        <p>${message}</p>
                    </div>
                `;

                document.body.appendChild(notification);

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
            }

            updateUI() {
                const updateButton = document.getElementById('check-updates-btn');
                const progressBar = document.getElementById('update-progress');
                const statusText = document.getElementById('update-status');

                if (updateButton) {
                    if (this.isDownloading) {
                        updateButton.textContent = 'Downloading...';
                        updateButton.disabled = true;
                    } else if (this.isUpdateAvailable) {
                        updateButton.textContent = 'Update Available';
                        updateButton.disabled = false;
                    } else {
                        updateButton.textContent = 'Check for Updates';
                        updateButton.disabled = false;
                    }
                }

                if (progressBar) {
                    if (this.isDownloading) {
                        progressBar.style.display = 'block';
                        progressBar.value = this.downloadProgress;
                    } else {
                        progressBar.style.display = 'none';
                    }
                }

                if (statusText) {
                    statusText.textContent = this.updateStatus;
                }
            }
        }

        const testUpdateManager = new TestUpdateManager();

        function testCheckForUpdates() {
            testUpdateManager.handleUpdateStatus('Checking for update...');
            setTimeout(() => {
                testUpdateManager.handleUpdateStatus('Update not available.');
            }, 2000);
        }

        function simulateUpdateAvailable() {
            testUpdateManager.handleUpdateStatus('Update available.');
        }

        function simulateDownloading() {
            testUpdateManager.handleUpdateStatus('Download speed: 1234567 - Downloaded 0% (0/1000000)');
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                testUpdateManager.handleUpdateStatus(`Download speed: 1234567 - Downloaded ${progress}% (${progress * 10000}/1000000)`);
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        testUpdateManager.handleUpdateStatus('Update downloaded');
                    }, 500);
                }
            }, 300);
        }

        function simulateDownloaded() {
            testUpdateManager.handleUpdateStatus('Update downloaded');
        }

        function simulateError() {
            testUpdateManager.handleUpdateStatus('Error in auto-updater: Network error');
        }

        function simulateNoUpdate() {
            testUpdateManager.handleUpdateStatus('Update not available.');
        }
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Created test-updater-ui.html${NC}"
echo ""
echo -e "${YELLOW}📖 Instructions:${NC}"
echo "1. Open test-updater-ui.html in your browser to test the UI"
echo "2. Click the simulation buttons to see how the updater behaves"
echo "3. Use this as a reference for integrating into your app"
echo ""
echo -e "${YELLOW}🔧 For Electron development:${NC}"
echo "1. Add UpdaterUI.js to your renderer process"
echo "2. Initialize the UpdateManager in your app"
echo "3. The auto-updater will work automatically in packaged builds"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo "  test-updater-ui.html - Interactive test interface"
echo ""
echo -e "${GREEN}🚀 Next steps:${NC}"
echo "  ./validate-release.sh  # Validate your setup"
echo "  ./release.sh patch     # Create a test release"

# Open the test file if possible
if command -v open &> /dev/null; then
    read -p "🌐 Open test UI in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open test-updater-ui.html
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "🌐 Open test UI in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open test-updater-ui.html
    fi
fi
