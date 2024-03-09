const isDev = require('electron-is-dev');
const url = require('url');
const path = require('path');

module.exports = function () {
  return isDev
    ? 'http://localhost:3000'
    : url.format({
      pathname: path.join(__dirname, '/../../../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
};
