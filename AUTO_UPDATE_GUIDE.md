# Auto-Update Setup Guide

This guide explains how to set up and use the auto-update functionality for Pro Backup.

## Overview

The Pro Backup app now includes automatic update functionality using GitHub releases. When you publish a new release, users will be automatically notified and can update their app seamlessly.

## How Auto-Updates Work

1. **Automatic Check**: The app checks for updates when it starts (only in production builds)
2. **Background Download**: If an update is available, it downloads in the background
3. **User Notification**: Users are notified when an update is ready to install
4. **Installation**: Users can choose to restart and install immediately or later

## For Developers: Creating Releases

### Method 1: Tag-based Release (Recommended)

1. Update the version in `package.json`:
   ```bash
   yarn version --new-version 1.3.0
   ```

2. Push the tag to trigger GitHub Actions:
   ```bash
   git push origin v1.3.0
   ```

3. GitHub Actions will automatically:
   - Build the app for Windows, macOS, and Linux
   - Create a GitHub release
   - Upload the built artifacts

### Method 2: Manual Release via GitHub Actions

1. Go to the "Actions" tab in your GitHub repository
2. Select "Manual Release" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., 1.2.0)
5. The workflow will build and publish the release

### Method 3: Local Build and Publish

```bash
# Build and publish for all platforms
yarn publish:all

# Or build for specific platforms
yarn publish:windows
yarn publish:mac
yarn publish:linux
```

## For Users: Using Auto-Updates

### Automatic Updates

- The app automatically checks for updates on startup
- If an update is available, you'll see a notification
- Updates download in the background
- You'll be prompted to restart when the download is complete

### Manual Update Check

You can manually check for updates through the app's interface (if implemented in the UI).

## Configuration

The auto-updater is configured in `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "bikirandev",
      "repo": "7160EL-Pro-Backup"
    }
  }
}
```

## API Usage

If you want to integrate update checking into your app's UI, you can use these APIs:

```javascript
// Check for updates manually
await window.api.checkForUpdates()

// Download and install update
await window.api.downloadUpdate()

// Listen for update status
window.api.onUpdaterStatus((status) => {
  console.log('Update status:', status)
})
```

## Important Notes

1. **Development Mode**: Auto-updates are disabled in development mode
2. **Code Signing**: For production releases, consider setting up code signing for Windows and macOS
3. **GitHub Token**: The GitHub Actions workflow uses `GITHUB_TOKEN` automatically
4. **Version Management**: Always increment the version number before creating a release

## Troubleshooting

### Updates Not Working

1. Check if the app is in production mode (`app.isPackaged` returns true)
2. Verify the GitHub repository settings in `package.json`
3. Check the app logs for error messages
4. Ensure the release is published (not draft) on GitHub

### Build Failures

1. Check GitHub Actions logs for detailed error messages
2. Verify all dependencies are properly listed in `package.json`
3. Ensure the build environment has all required tools

## Security Considerations

1. **Code Signing**: Set up code signing certificates for production releases
2. **Update Server**: Updates are served directly from GitHub releases
3. **Verification**: electron-updater verifies update signatures automatically (when signed)

## Code Signing Setup (Optional)

### For macOS:
- Set `APPLE_ID`, `APPLE_ID_PASS`, `CSC_LINK`, and `CSC_KEY_PASSWORD` secrets in GitHub

### For Windows:
- Set `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` secrets in GitHub

## Files Modified/Added

- `src/utils/AutoUpdater.js` - Auto-updater logic
- `src/Api/UpdaterApi.js` - API for update functions
- `src/main.js` - Integration with main process
- `src/ApiRegistry.js` - API registration
- `package.json` - Build and publish configuration
- `.github/workflows/release.yml` - Automated release workflow
- `.github/workflows/manual-release.yml` - Manual release workflow
