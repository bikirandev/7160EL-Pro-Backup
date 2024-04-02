const { createDirForce, copyDir, removeDir } = require('../../utils/FileOperation')
const { generateDirPath } = require('../Configs/ConfigModel')
const path = require('path')
const tar = require('tar')

const dirBackup = async (data) => {
  const sourcePath = data.databaseOrPath

  if (data.type !== 'directory') {
    return { error: 0, message: 'Skipped', data: [], skipped: true }
  }

  try {
    const confBackupPath = await generateDirPath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.dirName) {
      return { error: 1, message: 'Unable to generate directory name', data: null }
    }
    const tempPath = path.join(confBackupPath.data.defDirPath, '.temp', confBackupPath.data.dirName)

    // Create Directory if not exists
    await createDirForce(tempPath)

    // copy directory from source dir to temp dir
    await copyDir(sourcePath, tempPath)

    // create tar file of temp directory
    const tarPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.dirName) + '.tar'
    await tar.create({ gzip: true, file: tarPath, cwd: path.dirname(tempPath) }, [
      confBackupPath.data.dirName,
    ])

    // remove temp directory
    await removeDir(tempPath)

    return { error: 0, message: 'Backup', data: { backupPath: tarPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

module.exports = {
  dirBackup,
}
