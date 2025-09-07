// Notes routes (protected by JWT middleware)
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const notesController = require('../controllers/notesController');

// Create a note
router.post(
	'/',
	auth,
	[
		body('title').isString().notEmpty().withMessage('Title is required.'),
		body('content').isString().notEmpty().withMessage('Content is required.'),
		body('tags').optional().isArray().withMessage('Tags must be an array of strings.')
	],
	notesController.createNote
);

// Get all notes (with tag filtering)
router.get('/', auth, notesController.getNotes);

// Get a single note by ID
router.get(
	'/:id',
	auth,
	[param('id').isMongoId().withMessage('Invalid note ID.')],
	notesController.getNoteById
);

// Update a note
router.put(
	'/:id',
	auth,
	[
		param('id').isMongoId().withMessage('Invalid note ID.'),
		body('title').optional().isString(),
		body('content').optional().isString(),
		body('tags').optional().isArray()
	],
	notesController.updateNote
);

// Delete a note
router.delete(
	'/:id',
	auth,
	[param('id').isMongoId().withMessage('Invalid note ID.')],
	notesController.deleteNote
);

module.exports = router;
