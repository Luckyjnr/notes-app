
/**
 * Authentication Controller
 * Handles user signup, OTP email verification, and login.
 * - Signup: Registers user, sends OTP to email
 * - Verify OTP: Activates user after email verification
 * - Login: Authenticates verified users and returns JWT
 *
 * All passwords are hashed with bcrypt.
 * Email sending uses Mailtrap via Nodemailer.
 * Only verified users can log in and access protected routes.
 */
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


// Generate a 6-digit OTP for email verification
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Registers a new user and sends OTP to user's email for verification
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const user = new User({ name, email, phone, password: hashedPassword, otp, otpExpires, isVerified: false });
    await user.save();

    // Send OTP email via Mailtrap
    await transporter.sendMail({
      from: 'notes-app@example.com',
      to: email,
      subject: 'Your Notes App OTP',
      text: `Your OTP is: ${otp}`,
    });

    res.status(201).json({ message: 'User registered. OTP sent to email.' });
  } catch (err) {
    console.log('Signup error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
  
// Verifies the OTP sent to user's email and activates the user account
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'OTP verified. You can now log in.' });
  } catch (err) {
    console.log('OTP verification error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
  
// Authenticates user and returns JWT token (only for verified users)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email with OTP before logging in.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = require('jsonwebtoken').sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful.', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
