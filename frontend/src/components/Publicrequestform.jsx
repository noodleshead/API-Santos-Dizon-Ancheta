import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaFileAlt, FaShieldAlt, FaClock } from 'react-icons/fa';
import apiService from '../../utils/api';

const PublicRequestForm = () => {
  const [formData, setFormData] = useState({
    documentType: '',
    fullName: '',
    address: '',
    contactNumber: '',
    birthDate: '',
    purpose: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const documentTypes = [
    { value: 'barangay_clearance', label: 'Barangay Clearance' },
    { value: 'certificate_of_residency', label: 'Certificate of Residency' },
    { value: 'certificate_of_indigency', label: 'Certificate of Indigency' },
    { value: 'business_permit', label: 'Business Permit' },
    { value: 'certificate_of_good_moral', label: 'Certificate of Good Moral' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitResult(null);

    try {
      const requestData = {
        documentType: formData.documentType,
        requesterInfo: {
          fullName: formData.fullName,
          address: formData.address,
          contactNumber: formData.contactNumber,
          birthDate: formData.birthDate
        },
        purpose: formData.purpose
      };

      const response = await apiService.submitRequest(requestData);
      
      if (response.success) {
        setSubmitResult(response.data);
        // Reset form
        setFormData({
          documentType: '',
          fullName: '',
          address: '',
          contactNumber: '',
          birthDate: '',
          purpose: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Privacy Notice */}
          <div className="privacy-notice mb-4">
            <div className="d-flex align-items-center mb-2">
              <FaShieldAlt className="me-2" size={24} />
              <h5 className="mb-0">Privacy-First System</h5>
            </div>
            <p className="mb-0">
              <strong>Your privacy is protected:</strong> Your personal information is used only for 
              processing this request and is automatically deleted after 7 days. We do not store 
              resident profiles or maintain permanent databases of personal data.
            </p>
          </div>

          <Card className="card-custom">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="icon-box icon-box-primary mx-auto">
                  <FaFileAlt />
                </div>
                <h2 className="mb-2">Request Barangay Document</h2>
                <p className="text-muted">
                  Fill out the form below to request a document. Save your Request ID to track status.
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="alert-custom">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {submitResult && (
                <Alert variant="success" className="alert-custom">
                  <h5 className="mb-3">✓ Request Submitted Successfully!</h5>
                  
                  <div className="mb-3">
                    <strong>Request ID (Please save this):</strong>
                    <div className="request-id-display mt-2">
                      {submitResult.requestId}
                    </div>
                  </div>

                  <p className="mb-2">
                    <strong>Document Type:</strong> {submitResult.documentType.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> <span className="status-badge status-pending">{submitResult.status}</span>
                  </p>
                  <p className="mb-2">
                    <strong>Submitted:</strong> {new Date(submitResult.submittedAt).toLocaleString()}
                  </p>
                  <p className="mb-3">
                    <strong>Expires:</strong> {new Date(submitResult.expiresAt).toLocaleString()}
                  </p>

                  <Alert variant="warning" className="mb-0">
                    <FaClock className="me-2" />
                    <strong>Important:</strong> {submitResult.note}
                  </Alert>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Document Type *</Form.Label>
                      <Form.Select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select document type...</option>
                        {documentTypes.map((doc) => (
                          <option key={doc.value} value={doc.value}>
                            {doc.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Juan Dela Cruz"
                        required
                        minLength={3}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Complete Address *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Block, Lot, Street, Subdivision/Village, Barangay, City"
                        required
                        minLength={10}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Contact Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="09XXXXXXXXX"
                        required
                      />
                      <Form.Text className="text-muted">
                        Format: 09XXXXXXXXX
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Birth Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Purpose</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        placeholder="State the purpose of your request (optional)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-center mt-4">
                  <Button
                    type="submit"
                    className="btn-gradient"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicRequestForm;