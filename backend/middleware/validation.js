// Validation middleware for document requests
const validateDocumentRequest = (req, res, next) => {
  const { documentType, requesterInfo } = req.body;

  // Validate document type
  const allowedDocumentTypes = [
    'barangay_clearance',
    'certificate_of_residency',
    'certificate_of_indigency',
    'business_permit',
    'certificate_of_good_moral'
  ];

  if (!documentType || !allowedDocumentTypes.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document type. Allowed types: ' + allowedDocumentTypes.join(', ')
    });
  }

  // Validate required personal information (temporary use only)
  if (!requesterInfo || typeof requesterInfo !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Requester information is required.'
    });
  }

  const requiredFields = ['fullName', 'address', 'contactNumber'];
  const missingFields = requiredFields.filter(field => !requesterInfo[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Validate data formats
  const phoneRegex = /^(09|\+639)\d{9}$/;
  if (!phoneRegex.test(requesterInfo.contactNumber.replace(/[-\s]/g, ''))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format. Use format: 09XXXXXXXXX'
    });
  }

  // Sanitize inputs (basic XSS prevention)
  Object.keys(requesterInfo).forEach(key => {
    if (typeof requesterInfo[key] === 'string') {
      requesterInfo[key] = requesterInfo[key].trim().replace(/[<>]/g, '');
    }
  });

  next();
};

// Validate request ID format
const validateRequestId = (req, res, next) => {
  const { requestId } = req.params;
  
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!requestId || !uuidRegex.test(requestId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request ID format.'
    });
  }

  next();
};

module.exports = {
  validateDocumentRequest,
  validateRequestId
};