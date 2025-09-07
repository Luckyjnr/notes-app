// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet()); // Secure HTTP headers
app.use(bodyParser.json());

// Rate limiting for login route
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: 'Too many login attempts, please try again later.'
});

app.use(express.static('public'));

// Authentication routes
app.use('/api/auth/login', loginLimiter, require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));

// Notes routes (protected)
app.use('/api/notes', require('./routes/notes'));

module.exports = app;
