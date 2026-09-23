const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or account deactivated' });
      }

      req.user = user;
      next();
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized: no token provided' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized: token invalid or expired' });
  }
};

// Admin only middleware
const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

// Optional auth - populates req.user if token is valid, but does not block if not
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = { protect, adminProtect, optionalAuth };