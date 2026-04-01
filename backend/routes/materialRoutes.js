const express = require('express');
const router = express.Router();
const {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  downloadMaterial,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { buildUploader } = require('../middleware/uploadMiddleware');

const uploadMaterial = buildUploader('materials').any();

const normalizeFileInput = (req, _res, next) => {
  if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
    req.file = req.files[0];
  }
  next();
};

router.use(protect);

router.get('/', listMaterials);

router.get('/search', searchMaterials);

router.get('/download/:id', downloadMaterial);

router.post('/create', authorize('TEACHER'), uploadMaterial, normalizeFileInput, createMaterial);

router.put('/edit/:id', authorize('TEACHER'), uploadMaterial, normalizeFileInput, updateMaterial);

router.post('/', authorize('TEACHER'), uploadMaterial, normalizeFileInput, createMaterial);

router.route('/delete/:id')
  .delete(authorize('TEACHER'), deleteMaterial);

router.route('/:id')
  .delete(authorize('TEACHER'), deleteMaterial);

module.exports = router;
