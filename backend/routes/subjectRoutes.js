const express = require('express');
const router = express.Router();
const { listSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', listSubjects);
router.post('/', authorize('ADMIN'), createSubject);
router.put('/:id', authorize('ADMIN'), updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);

module.exports = router;
