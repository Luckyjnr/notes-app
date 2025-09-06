// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User signup (with OTP email)
router.post('/signup', authController.signup);

// OTP verification
router.post('/verify-otp', authController.verifyOtp);

// User login (JWT)
router.post('/login', authController.login);

module.exports = router;
