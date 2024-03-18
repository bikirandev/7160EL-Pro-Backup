const handleSetTitle = (win, title) => {
  // const webContents = event.sender;
  // const win = BrowserWindow.fromWebContents(webContents);
  // console.log(title);
  win.setTitle(title)
}

module.exports = handleSetTitle
