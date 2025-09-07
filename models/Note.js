// Notes model schema for CRUD operations and tag filtering
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
    index: true, // For tag filtering
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Create index for tags array
noteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
