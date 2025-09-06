// Notes routes (protected by JWT middleware)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all notes (protected)
router.get('/', auth, (req, res) => {
  res.json({ message: 'Get all notes (protected)' });
});

// Create a note (protected)
router.post('/', auth, (req, res) => {
  res.json({ message: 'Create a note (protected)' });
});

module.exports = router;
