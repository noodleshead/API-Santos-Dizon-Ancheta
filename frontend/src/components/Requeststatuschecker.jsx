import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSearch, FaCheckCircle, FaClock } from 'react-icons/fa';
import apiService from '../../utils/api';

const RequestStatusChecker = () => {
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusData(null);

    try {
      const response = await apiService.getRequestStatus(requestId);
      
      if (response.success) {
        setStatusData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Request not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      approved: 'status-approved',
      rejected: 'status-rejected',
      completed: 'status-completed'
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="card-custom">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="icon-box icon-box-success mx-auto">
                  <FaSearch />
                </div>
                <h2 className="mb-2">Check Request Status</h2>
                <p className="text-muted">
                  Enter your Request ID to check the status of your document request
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="alert-custom">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Request ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    required
                    className="text-center"
                    style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
                  />
                  <Form.Text className="text-muted">
                    Enter the Request ID you received when submitting your request
                  </Form.Text>
                </Form.Group>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="btn-success-custom"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <FaSearch className="me-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {statusData && (
                <div className="mt-4">
                  <hr />
                  <h4 className="mb-4 text-center">
                    <FaCheckCircle className="text-success me-2" />
                    Request Details
                  </h4>

                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Request ID</small>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                          {statusData.requestId}
                        </div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">Document Type</small>
                        <strong className="text-primary">
                          {statusData.documentType.replace(/_/g, ' ').toUpperCase()}
                        </strong>
                      </div>
                    </Col>

                    <Col md={12} className="mb-3">
                      <div className="p-3 bg-light rounded text-center">
                        <small className="text-muted d-block mb-2">Current Status</small>
                        <span className={getStatusBadgeClass(statusData.status)}>
                          {statusData.status}
                        </span>
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">
                          <FaClock className="me-1" />
                          Submitted
                        </small>
                        <div>{new Date(statusData.submittedAt).toLocaleString()}</div>
                      </div>
                    </Col>

                    <Col md={6} className="mb-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">
                          <FaClock className="me-1" />
                          Last Updated
                        </small>
                        <div>{new Date(statusData.lastUpdated).toLocaleString()}</div>
                      </div>
                    </Col>

                    <Col md={12}>
                      <Alert variant="info" className="alert-custom mb-0">
                        <strong>Note:</strong> Request expires on{' '}
                        <strong>{new Date(statusData.expiresAt).toLocaleString()}</strong>. 
                        After this date, the request will be automatically removed from the system.
                      </Alert>
                    </Col>
                  </Row>

                  {statusData.status === 'completed' && (
                    <Alert variant="success" className="alert-custom mt-3 text-center">
                      <FaCheckCircle size={30} className="mb-2 d-block mx-auto" />
                      <strong>Your document is ready for pickup!</strong>
                      <p className="mb-0 mt-2">
                        Please visit the Barangay Hall during office hours to claim your document.
                      </p>
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestStatusChecker;