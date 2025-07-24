# Testing Auto-Update Functionality

## Test in Development Mode

```bash
# Start the app in development mode
yarn start
```

You should see in the console:
```
Running in development mode, auto-updater disabled
```

## Test in Production Mode (Packaged App)

1. **Build the app:**
   ```bash
   yarn build
   ```

2. **Run the built app** (from the `dist` folder)

3. **Check the logs** - The app should check for updates on startup

## Test Update Flow

1. **Create a test release on GitHub:**
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag version: `v1.1.15` (increment from current 1.1.14)
   - Add release notes
   - Publish the release

2. **Test with a packaged app:**
   - Run the app built from an older version
   - It should detect the new release and show update notifications

## Manual Testing Commands

```bash
# Test building for different platforms
yarn build:windows
yarn build:mac  
yarn build:linux

# Test publishing (requires GitHub token)
yarn publish:windows
yarn publish:mac
yarn publish:linux
```

## Debug Auto-Updater

Add this to your main.js for debugging:

```javascript
// In development, you can test the updater UI by mocking events
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    win.webContents.send('updater-status', 'Checking for update...')
  }, 2000)
  
  setTimeout(() => {
    win.webContents.send('updater-status', 'Update available.')
  }, 4000)
  
  setTimeout(() => {
    win.webContents.send('updater-status', 'Download speed: 1234567 - Downloaded 45% (123456/789012)')
  }, 6000)
  
  setTimeout(() => {
    win.webContents.send('updater-status', 'Update downloaded')
  }, 8000)
}
```

## Verify Setup

1. ✅ `electron-updater` installed
2. ✅ `electron-log` installed  
3. ✅ `package.json` has `publish` configuration
4. ✅ GitHub Actions workflows created
5. ✅ Auto-updater integrated in main process
6. ✅ API exposed for manual updates
7. ✅ Repository information correct

## Common Issues

1. **Updates not detected**: Check GitHub release is published (not draft)
2. **Build failures**: Verify all dependencies in package.json
3. **Permission errors**: Ensure proper GitHub token permissions

## Next Steps

1. Test the complete flow with a real release
2. Integrate update UI into your app interface
3. Set up code signing for production releases
4. Configure notification preferences
