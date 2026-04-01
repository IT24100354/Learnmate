const express = require('express');
const router = express.Router();
const { createClass, getClasses, getClassById, updateClass, deleteClass, getTeacherClasses, getClassStudents } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(authorize('ADMIN'), createClass);

router.get('/teacher/:id', authorize('TEACHER', 'ADMIN'), getTeacherClasses);
router.get('/:id/students', authorize('TEACHER', 'ADMIN'), getClassStudents);

router.route('/:id')
  .get(getClassById)
  .put(authorize('ADMIN'), updateClass)
  .delete(authorize('ADMIN'), deleteClass);

module.exports = router;
