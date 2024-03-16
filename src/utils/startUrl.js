const url = require('url')
const path = require('path')
const fs = require('fs')

const GetUrl = () => {
  const isDev = process.env.npm_lifecycle_event === 'electron'

  //--Save a log file to see if the url is correct
  fs.writeFileSync('log.txt', JSON.stringify(process.env), (err) => {
    if (err) throw err
  })

  console.log('dev', isDev)

  if (isDev) {
    return    'http://localhost:3000'
  }

  console.log('Path', url)

  return url.format({
    pathname: path.join(__dirname, '/../../../build/index.html'),
    protocol: 'file:',
    slashes: true,
  })
}

module.exports = GetUrl
