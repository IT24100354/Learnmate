const express = require('express');
const router = express.Router();
const {
  listFees,
  getFeeOptions,
  createFee,
  updateFee,
  deleteFee,
  verifyFee,
  searchFees,
  parentPay,
  createSubjectFee,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { buildUploader } = require('../middleware/uploadMiddleware');

const paymentSlipUpload = buildUploader('payment-slips', {
  allowMime: ['image/', 'application/pdf'],
}).single('slip');

router.use(protect);

router.get('/list', authorize('PARENT', 'ADMIN'), listFees);
router.get('/options', authorize('ADMIN'), getFeeOptions);
router.get('/search', authorize('ADMIN', 'PARENT'), searchFees);

router.post('/create', authorize('ADMIN'), createFee);
router.put('/edit/:id', authorize('ADMIN'), updateFee);
router.delete('/delete/:id', authorize('ADMIN'), deleteFee);
router.post('/verify/:id', authorize('ADMIN'), verifyFee);

router.post('/parent-pay', authorize('PARENT'), paymentSlipUpload, parentPay);
router.post('/create-subject-fee', authorize('ADMIN'), createSubjectFee);

module.exports = router;
