const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const [users] = await pool.query(
      'SELECT user_id, username, role FROM api_users WHERE user_id = ? AND is_active = true',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    req.user = {
      userId: users[0].user_id,
      username: users[0].username,
      role: users[0].role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };