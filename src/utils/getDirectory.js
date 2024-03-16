const { BrowserWindow, dialog } = require('electron');



// Function to get directory
const getDirectory = () => {
  return new Promise((resolve, reject) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      openDialog().then(result => {
        resolve(result);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    }
  });
};

// Function to open directory dialog
const openDialog = () => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        resolve(result.filePaths[0]);
      } else {
        reject("Dialog canceled");
      }
    }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
};

module.exports = getDirectory;
