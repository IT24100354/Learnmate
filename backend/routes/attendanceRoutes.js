const express = require('express');
const router = express.Router();
const {
  listAttendances,
  createAttendance,
  updateAttendanceStatus,
  deleteAttendance,
  getStudentAttendance,
  searchAttendances,
  searchAttendancesByClass,
  searchAttendancesByDate,
  selectClassForAttendance,
  markAttendanceForClass,
  processBulkAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', listAttendances);

router.post('/create', authorize('TEACHER'), createAttendance);

router.put('/edit/:id', authorize('TEACHER', 'ADMIN'), updateAttendanceStatus);

router.delete('/delete/:id', authorize('TEACHER', 'ADMIN'), deleteAttendance);

router.get('/search', searchAttendances);

router.get('/search-by-class', authorize('TEACHER', 'ADMIN'), searchAttendancesByClass);

router.get('/search-by-date', searchAttendancesByDate);

router.get('/mark', authorize('TEACHER'), selectClassForAttendance);

router.get('/mark/:classId', authorize('TEACHER'), markAttendanceForClass);

router.post('/mark/:classId', authorize('TEACHER'), processBulkAttendance);

router.route('/student/:studentId')
  .get(getStudentAttendance);

module.exports = router;
