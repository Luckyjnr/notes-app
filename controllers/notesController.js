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
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    const note = new Note({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      owner: req.user.userId,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Get all notes for the logged-in user, with optional tag filtering
 */
exports.getNotes = async (req, res) => {
  try {
    const { tag, tags } = req.query;
    let filter = { owner: req.user.userId };
    if (tag) {
      filter.tags = tag;
    } else if (tags) {
      filter.tags = { $all: tags.split(',') };
    }
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Get a single note by ID (only if owner)
 */
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Update a note (only if owner)
 */
exports.updateNote = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = Array.isArray(tags) ? tags : [];
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Delete a note (only if owner)
 */
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
