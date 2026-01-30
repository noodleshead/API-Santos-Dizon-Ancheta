const express = require('express');
const router = express.Router();
const DocumentRequestController = require('../controller/requestController');
const AuthController = require('../controller/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDocumentRequest, validateRequestId } = require('../middleware/validation');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Submit a document request (public access)
router.post(
  '/requests',
  validateDocumentRequest,
  DocumentRequestController.submitRequest
);

// Check request status by ID (public access)
router.get(
  '/requests/:requestId/status',
  validateRequestId,
  DocumentRequestController.getRequestStatus
);

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Login
router.post('/auth/login', AuthController.login);

// Register (should be restricted in production - only admin can create users)
router.post('/auth/register', AuthController.register);

// Get current user (requires authentication)
router.get('/auth/me', authenticateToken, AuthController.getCurrentUser);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Get all requests (staff and admin)
router.get(
  '/requests',
  authenticateToken,
  DocumentRequestController.getPendingRequests
);

// Update request status (staff and admin)
router.patch(
  '/requests/:requestId/status',
  authenticateToken,
  validateRequestId,
  DocumentRequestController.updateRequestStatus
);

// Cleanup expired requests (admin only)
router.delete(
  '/requests/cleanup',
  authenticateToken,
  authorizeRoles('admin'),
  DocumentRequestController.cleanupRequests
);

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Barangay Management API is running',
    timestamp: new Date().toISOString(),
    privacyNotice: 'This API does not store personal resident data permanently'
  });
});

module.exports = router;