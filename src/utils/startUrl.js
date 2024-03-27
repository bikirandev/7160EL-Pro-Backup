/* eslint-disable no-constant-condition */
const url = require('url')
const process = require('process')
const path = require('path') // Import the 'path' module

const GetUrl = () => {
  const isDev = process.env.npm_lifecycle_event === 'electron'
  if (!isDev) {
    return 'http://localhost:3000'
  }

  return url.format({
    // eslint-disable-next-line no-undef
    pathname: path.resolve(__dirname, '/../../../build/index.html'), // Use path.resolve instead of path.join
    protocol: 'file:',
    slashes: true,
  })
}

module.exports = GetUrl
