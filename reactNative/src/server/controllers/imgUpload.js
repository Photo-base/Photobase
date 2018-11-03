'use strict';
const Storage = require('@google-cloud/storage');

//to upload: https://medium.com/google-cloud/upload-images-to-google-cloud-storage-with-react-native-and-expressjs-61b8874abc49

const storage = Storage({
  projectId: 'house-stark-214820',
  // keyFilename: '/home/slaglebagel17/Coding/Codesmith Junior/tinge/src/client/House-Stark-688a45b58a37.json'
  //don't believe the top is necessary
});

const bucketName = 'winter-is-here'
const bucket = storage.bucket(bucketName);

function getPublicUrl(filename) {
  return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
}

let ImgUpload = {};

ImgUpload.uploadToGcs = (req, res, next) => {
  if(!req.file) return next();

  // Can optionally add a path to the gcsname below by concatenating it before the filename
  const gcsname = req.file.originalname;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    },
    resumable: false
  });

 stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      next();
    });
  });

  stream.end(req.file.buffer);
}

module.exports = ImgUpload;