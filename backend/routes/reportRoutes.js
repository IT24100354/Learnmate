const express = require('express');
const router = express.Router();
const {
  getAttendanceReportPDF,
  getAttendanceReportCSV,
  getMarksReportPDF,
  getMarksReportCSV,
  getFeesReportPDF,
  getFeesReportCSV
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Attendance Reports
router.get('/attendance/pdf', getAttendanceReportPDF);
router.get('/attendance/csv', getAttendanceReportCSV);

// Marks Reports
router.get('/marks/pdf', getMarksReportPDF);
router.get('/marks/csv', getMarksReportCSV);

// Fees Reports
router.get('/fees/pdf', getFeesReportPDF);
router.get('/fees/csv', getFeesReportCSV);

module.exports = router;
