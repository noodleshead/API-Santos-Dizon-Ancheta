const mysql = require('mysql2/promise');
require('dotenv').config();

// Database pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Table 1: Only stores request status tracking (NO personal data)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS document_requests (
        request_id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(50) NOT NULL,
        request_status ENUM('pending', 'processing', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_status (request_status),
        INDEX idx_expires (expires_at)
      )
    `);

    // Table 2: API authentication users (barangay staff only)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS api_users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);

    // Table 3: Audit logs (security tracking, no personal data)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        user_id INT,
        request_id VARCHAR(36),
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at),
        INDEX idx_request (request_id)
      )
    `);

    // Auto-cleanup job for expired requests (privacy compliance)
    await connection.query(`
      CREATE EVENT IF NOT EXISTS cleanup_expired_requests
      ON SCHEDULE EVERY 1 HOUR
      DO
        DELETE FROM document_requests
        WHERE expires_at < NOW()
    `);

    console.log('✓ Database tables initialized');
    connection.release();
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = { pool, testConnection, initializeDatabase };