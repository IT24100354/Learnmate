const express = require('express');
const router = express.Router();
const { getRegisterOptions, register, login } = require('../controllers/authController');

router.get('/register-options', getRegisterOptions);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
