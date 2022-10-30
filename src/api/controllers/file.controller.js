const path = require('path');
const multer = require('multer');
const { Types } = require('mongoose');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/uploads');
  },
  filename(req, file, cb) {
    cb(null, Types.ObjectId().toString() + path.extname(file.originalname));
  },
});

const uploadImage = multer({ storage }).single('image');
module.exports = { uploadImage };
