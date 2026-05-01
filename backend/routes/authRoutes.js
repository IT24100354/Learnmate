const express = require('express');
const router = express.Router();
const { getRegisterOptions, register, login, forgotPassword, requestPasswordResetOtp } = require('../controllers/authController');

router.get('/register-options', getRegisterOptions);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/request-otp', requestPasswordResetOtp);
router.post('/forgot-password', forgotPassword);

module.exports = router;
