const ncp = require('ncp').ncp

// Function to copy directory to temp folder
const copySourceToTemp = async (sourcePath, tempPath) => {
  // copy file from source to temp
  let copiedSize = 0
  ncp(
    sourcePath,
    tempPath,
    {
      clobber: true,
      transform: function (read, write, file) {
        const totalSize = file.size
        read.on('data', function (chunk) {
          copiedSize += chunk.length
          console.log({ copiedSize, totalSize })
          console.log(`Copy progress: ${((copiedSize / totalSize) * 100).toFixed(2)}%`)
        })
        read.pipe(write)
      },
    },
    function (err) {
      if (err) {
        console.error(err)
        return
      }
      console.log('Copy complete!')
    },
  )

  console.log('Copy Done')
}

module.exports = {
  copySourceToTemp,
}
