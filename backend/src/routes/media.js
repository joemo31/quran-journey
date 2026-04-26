const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, getAll, getFolders, updateAlt, remove } = require('../controllers/mediaController');
const { normalizeFolder } = require('../config/storage');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = normalizeFolder(req.body.folder);
    req.body.folder = folder;
    const dir = path.join(__dirname, '../../uploads', ...folder.split('/'));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const rawName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const name = rawName.replace(/-+/g, '-').replace(/(^-|-$)/g, '') || 'file';
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime','application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const uploader = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

router.use(authenticate, authorize('admin'));
router.post('/upload', uploader.array('files', 20), upload);
router.get('/', getAll);
router.get('/folders', getFolders);
router.put('/:id', updateAlt);
router.delete('/:id', remove);

module.exports = router;
