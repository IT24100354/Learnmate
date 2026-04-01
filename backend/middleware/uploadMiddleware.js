const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadBase = path.join(__dirname, '..', 'uploads');

const ensureDirectory = (folderName) => {
  const fullPath = path.join(uploadBase, folderName);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const buildUploader = (folderName, options = {}) => {
  const destinationPath = ensureDirectory(folderName);

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, destinationPath);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname || '');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: options.maxFileSize || 10 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
      if (!options.allowMime || options.allowMime.length === 0) {
        cb(null, true);
        return;
      }

      if (options.allowMime.some((allowed) => file.mimetype.startsWith(allowed))) {
        cb(null, true);
        return;
      }

      cb(new Error('Unsupported file type'));
    },
  });
};

module.exports = {
  buildUploader,
};
