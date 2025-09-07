// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { body } = require('express-validator');

// User signup (with OTP email)
router.post(
	'/signup',
	[
		body('name').isString().notEmpty().withMessage('Name is required.'),
		body('email').isEmail().withMessage('Valid email is required.'),
		body('phone').isString().notEmpty().withMessage('Phone is required.'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
	],
	authController.signup
);

// OTP verification
router.post('/verify-otp', authController.verifyOtp);

// User login (JWT)
router.post('/login', authController.login);

module.exports = router;
