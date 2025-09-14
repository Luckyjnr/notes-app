
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

// Sends OTP to user's email for verification (no database storage)
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, password) are required.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists.'
        });
      }
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    
    // Store user data temporarily in memory (not database)
    // In production, use Redis or similar for temporary storage
    global.tempUsers = global.tempUsers || {};
    global.tempUsers[email] = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password, // Will be hashed during verification
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      createdAt: Date.now()
    };

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_FROM_EMAIL || 'vbe05520bnoah@gmail.com',
        to: email,
        subject: 'Your Notes App Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f76b1c;">Welcome to Notes App!</h2>
            <p>Thank you for registering. Please use the following code to verify your email:</p>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f76b1c; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
      });
      
      console.log(`OTP sent to ${email}: ${otp}`);
      console.log(`🔑 OTP for testing: ${otp}`);
      
      res.status(201).json({
        success: true,
        message: 'OTP sent to your email. Please verify your email to complete registration.'
      });
      
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Clean up temporary data
      delete global.tempUsers[email];
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};
  
// Verifies the OTP sent to user's email and creates the user account
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required.' 
      });
    }

    // Check if user data exists in temporary storage
    global.tempUsers = global.tempUsers || {};
    const tempUser = global.tempUsers[email.toLowerCase().trim()];
    
    if (!tempUser) {
      return res.status(404).json({ 
        success: false,
        message: 'No pending registration found for this email.' 
      });
    }

    // Check if OTP is valid and not expired
    if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP.' 
      });
    }

    // Hash password and create user in database
    const hashedPassword = await bcrypt.hash(tempUser.password, 12);
    
    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: hashedPassword,
      isVerified: true
    });

    await user.save();

    // Clean up temporary data
    delete global.tempUsers[email.toLowerCase().trim()];

    res.json({ 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during verification.' 
    });
  }
};
  
// Authenticates user and returns JWT token (only for verified users)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required.' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false,
        message: 'Please verify your email with OTP before logging in.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    const token = require('jsonwebtoken').sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      message: 'Login successful.', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login.' 
    });
  }
};
