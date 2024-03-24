const destinationPattern = {
  type: '', // gcloud-bucket, google-drive, aws-s3, dropbox
  title: '', // Name of the destination
  bucket: '',
  folder: '',
  accessKey: '',
  secretKey: '',
}

const destinationTypes = {
  DEST_GCLOUD: 'gcloud-bucket',
  // DEST_GDRIVE: 'google-drive',
  // DEST_AWS: 'aws-s3',
  // DEST_DROPBOX: 'dropbox',
}

const verifyGcloudData = (data) => {
  console.log(data)

  if (data.type !== destinationTypes.DEST_GCLOUD) {
    return { error: 0, message: 'Skipped', data: [] }
  }

  if (!data.title) {
    return { error: 1, message: 'Title is required', data: [] }
  }

  if (!data.bucket) {
    return { error: 1, message: 'Bucket is required', data: [] }
  }

  if (!data.folder) {
    return { error: 1, message: 'Folder is required', data: [] }
  }

  if (!data.accessKey) {
    return { error: 1, message: 'Access Key is required', data: [] }
  }

  if (!data.secretKey) {
    return { error: 1, message: 'Secret Key is required', data: [] }
  }

  return { error: 0, message: 'Data is valid', data: [] }
}

module.exports = {
  destinationPattern,
  destinationTypes,
  verifyGcloudData,
}
