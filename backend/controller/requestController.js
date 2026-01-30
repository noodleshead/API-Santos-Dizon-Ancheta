const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// PRIVACY PRINCIPLE: Personal data is NEVER stored in database
// Only request tracking information is persisted

class DocumentRequestController {
  
  // Submit a new document request
  static async submitRequest(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { documentType, requesterInfo, purpose } = req.body;
      const requestId = uuidv4();
      
      // IMPORTANT: Personal data (requesterInfo) is ONLY used for immediate validation
      // It is NOT stored in the database
      
      // Temporary in-memory validation
      const validationResult = DocumentRequestController.validateRequester(requesterInfo);
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message
        });
      }

      // Store ONLY request tracking data (NO personal information)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
      
      await connection.query(
        `INSERT INTO document_requests 
         (request_id, document_type, request_status, expires_at) 
         VALUES (?, ?, 'pending', ?)`,
        [requestId, documentType, expiresAt]
      );

      // Log the action (no personal data)
      await connection.query(
        `INSERT INTO audit_logs (action, user_id, request_id, ip_address) 
         VALUES (?, ?, ?, ?)`,
        ['REQUEST_SUBMITTED', req.user?.userId || null, requestId, req.ip]
      );

      await connection.commit();

      // Response includes temporary reference only
      res.status(201).json({
        success: true,
        message: 'Document request submitted successfully',
        data: {
          requestId,
          documentType,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          note: 'Please save this Request ID. Personal data is not stored in our system.'
        }
      });

      // Personal data (requesterInfo) is automatically garbage collected
      // after this function completes - NO PERMANENT STORAGE
      
    } catch (error) {
      await connection.rollback();
      console.error('Request submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit request. Please try again.'
      });
    } finally {
      connection.release();
    }
  }

  // Get request status (public - no authentication needed)
  static async getRequestStatus(req, res) {
    try {
      const { requestId } = req.params;

      const [requests] = await pool.query(
        `SELECT request_id, document_type, request_status, created_at, updated_at, expires_at 
         FROM document_requests 
         WHERE request_id = ? AND expires_at > NOW()`,
        [requestId]
      );

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Request not found or has expired.'
        });
      }

      const request = requests[0];

      res.json({
        success: true,
        data: {
          requestId: request.request_id,
          documentType: request.document_type,
          status: request.request_status,
          submittedAt: request.created_at,
          lastUpdated: request.updated_at,
          expiresAt: request.expires_at
        }
      });

    } catch (error) {
      console.error('Status retrieval error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve request status.'
      });
    }
  }

  // Update request status (authenticated staff only)
  static async updateRequestStatus(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { requestId } = req.params;
      const { status, notes } = req.body;

      const allowedStatuses = ['pending', 'processing', 'approved', 'rejected', 'completed'];
      
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
        });
      }

      // Update request status
      const [result] = await connection.query(
        `UPDATE document_requests 
         SET request_status = ?, updated_at = NOW() 
         WHERE request_id = ? AND expires_at > NOW()`,
        [status, requestId]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Request not found or has expired.'
        });
      }

      // Log the action
      await connection.query(
        `INSERT INTO audit_logs (action, user_id, request_id, ip_address) 
         VALUES (?, ?, ?, ?)`,
        [`STATUS_UPDATED_TO_${status.toUpperCase()}`, req.user.userId, requestId, req.ip]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Request status updated to ${status}`,
        data: {
          requestId,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user.username
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Status update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update request status.'
      });
    } finally {
      connection.release();
    }
  }

  // Get all pending requests (authenticated staff only)
  static async getPendingRequests(req, res) {
    try {
      const { status } = req.query;
      
      let query = `
        SELECT request_id, document_type, request_status, created_at, updated_at, expires_at 
        FROM document_requests 
        WHERE expires_at > NOW()
      `;
      
      const params = [];
      
      if (status) {
        query += ' AND request_status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC LIMIT 100';

      const [requests] = await pool.query(query, params);

      res.json({
        success: true,
        count: requests.length,
        data: requests.map(req => ({
          requestId: req.request_id,
          documentType: req.document_type,
          status: req.request_status,
          submittedAt: req.created_at,
          lastUpdated: req.updated_at,
          expiresAt: req.expires_at
        }))
      });

    } catch (error) {
      console.error('Fetch requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve requests.'
      });
    }
  }

  // Delete expired/completed requests (admin only)
  static async cleanupRequests(req, res) {
    try {
      const [result] = await pool.query(
        'DELETE FROM document_requests WHERE expires_at < NOW() OR request_status = "completed"'
      );

      res.json({
        success: true,
        message: `Cleaned up ${result.affectedRows} expired/completed requests`,
        deletedCount: result.affectedRows
      });

    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup requests.'
      });
    }
  }

  // In-memory validation helper (data not stored)
  static validateRequester(requesterInfo) {
    const { fullName, address, contactNumber, birthDate } = requesterInfo;

    // Basic validation
    if (!fullName || fullName.length < 3) {
      return { isValid: false, message: 'Full name must be at least 3 characters' };
    }

    if (!address || address.length < 10) {
      return { isValid: false, message: 'Please provide complete address' };
    }

    // Age verification for certain documents (if birthDate provided)
    if (birthDate) {
      const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
      if (age < 18) {
        return { isValid: false, message: 'Requester must be at least 18 years old' };
      }
    }

    return { isValid: true };
  }
}

module.exports = DocumentRequestController;