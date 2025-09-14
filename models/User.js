// User model schema for authentication and verification
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // User's full name
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // User's email address
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    // User's phone number
  },
  password: {
    type: String,
    required: true,
    // Hashed password
  },
  isVerified: {
    type: Boolean,
    default: false,
    // Email verification status
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // User creation timestamp
  },
});

module.exports = mongoose.model('User', userSchema);
