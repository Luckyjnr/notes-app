// Notes controller: CRUD operations, tag filtering, and owner restriction

const { validationResult } = require('express-validator');
const Note = require('../models/Note');

/**
 * Create a new note for the logged-in user
 */
exports.createNote = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and content are required.' 
      });
    }

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()).map(tag => tag.trim()) : [],
      owner: req.user.userId,
    });
    
    await note.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Note created successfully.',
      note 
    });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating note.' 
    });
  }
};

/**
 * Get all notes for the logged-in user, with optional tag filtering
 */
exports.getNotes = async (req, res) => {
  try {
    const { tag, tags, page = 1, limit = 10 } = req.query;
    let filter = { owner: req.user.userId };
    
    if (tag) {
      filter.tags = tag;
    } else if (tags) {
      filter.tags = { $all: tags.split(',').map(t => t.trim()) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Note.countDocuments(filter);

    res.json({ 
      success: true,
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNotes: total,
        hasNext: skip + notes.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching notes.' 
    });
  }
};

/**
 * Get a single note by ID (only if owner)
 */
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      owner: req.user.userId 
    }).select('-__v');
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found.' 
      });
    }
    
    res.json({ 
      success: true,
      note 
    });
  } catch (err) {
    console.error('Get note by ID error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching note.' 
    });
  }
};

/**
 * Update a note (only if owner)
 */
exports.updateNote = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findOne({ 
      _id: req.params.id, 
      owner: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found.' 
      });
    }
    
    if (title) note.title = title.trim();
    if (content) note.content = content.trim();
    if (tags) note.tags = Array.isArray(tags) ? tags.filter(tag => tag.trim()).map(tag => tag.trim()) : [];
    
    await note.save();
    
    res.json({ 
      success: true,
      message: 'Note updated successfully.',
      note 
    });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating note.' 
    });
  }
};

/**
 * Delete a note (only if owner)
 */
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found.' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Note deleted successfully.' 
    });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting note.' 
    });
  }
};
