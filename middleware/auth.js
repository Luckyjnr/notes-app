// JWT authentication middleware
// Protects routes by verifying JWT in Authorization header
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = (req, res, next) => {
  // Check for Bearer token in Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Verify JWT and attach user info to request
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
