// Express app setup
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Notes routes (protected)
app.use('/api/notes', require('./routes/notes'));

module.exports = app;
