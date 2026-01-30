const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class AuthController {
  
  // Register new staff/admin user
  static async register(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { username, password, role } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      // Check if username already exists
      const [existingUsers] = await connection.query(
        'SELECT user_id FROM api_users WHERE username = ?',
        [username]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const userRole = role === 'admin' ? 'admin' : 'staff';
      
      const [result] = await connection.query(
        'INSERT INTO api_users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, passwordHash, userRole]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: result.insertId,
          username,
          role: userRole
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    } finally {
      connection.release();
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user
      const [users] = await pool.query(
        'SELECT user_id, username, password_hash, role, is_active FROM api_users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await pool.query(
        'UPDATE api_users SET last_login = NOW() WHERE user_id = ?',
        [user.user_id]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.user_id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            userId: user.user_id,
            username: user.username,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      const [users] = await pool.query(
        'SELECT user_id, username, role, created_at, last_login FROM api_users WHERE user_id = ?',
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: users[0]
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user information'
      });
    }
  }
}

module.exports = AuthController;