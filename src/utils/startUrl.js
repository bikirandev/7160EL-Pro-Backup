const isDev = import('electron-is-dev');
const url = import('url');
const path = import('path');

const GetUrl = () => (isDev
  ? 'http://localhost:3000'
  : url.format({
    pathname: path.join(__dirname, '/../../../build/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

module.exports = GetUrl();
