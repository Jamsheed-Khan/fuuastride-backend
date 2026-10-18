const express = require('express');
const router = express.Router();
const { register, login, verifyPhone } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-phone', verifyPhone);

module.exports = router;