import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Modal } from 'react-bootstrap';
import { FaSync, FaCheckCircle, FaTimes, FaClock, FaSignOutAlt } from 'react-icons/fa';
import apiService from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [user, setUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAllRequests(filterStatus);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      const response = await apiService.updateRequestStatus(selectedRequest.requestId, {
        status: newStatus,
        notes: updateNotes
      });

      if (response.success) {
        setShowUpdateModal(false);
        setSelectedRequest(null);
        setNewStatus('');
        setUpdateNotes('');
        fetchRequests();
        alert('Request status updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const openUpdateModal = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowUpdateModal(true);
  };

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      approved: 'success',
      rejected: 'danger',
      completed: 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Staff Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome, <strong>{user?.username}</strong> ({user?.role})
              </p>
            </div>
            <Button variant="outline-danger" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.total}</h3>
              <small className="text-muted">Total Requests</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h3 className="text-warning">{stats.pending}</h3>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-info">
            <Card.Body>
              <h3 className="text-info">{stats.processing}</h3>
              <small className="text-muted">Processing</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="text-success">{stats.approved}</h3>
              <small className="text-muted">Approved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="text-primary">{stats.completed}</h3>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Button 
                variant="outline-primary" 
                onClick={fetchRequests}
                disabled={loading}
                className="w-100"
              >
                <FaSync className={loading ? 'fa-spin' : ''} />
                <div><small>Refresh</small></div>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Requests</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Requests Table */}
      <Card className="card-custom">
        <Card.Header>
          <h5 className="mb-0">Document Requests</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="loading-spinner"></div>
              <p className="mt-3">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No requests found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Request ID</th>
                    <th>Document Type</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Last Updated</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.requestId}>
                      <td>
                        <code style={{ fontSize: '0.75rem' }}>
                          {request.requestId.substring(0, 8)}...
                        </code>
                      </td>
                      <td>{request.documentType.replace(/_/g, ' ').toUpperCase()}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>{new Date(request.submittedAt).toLocaleDateString()}</td>
                      <td>{new Date(request.lastUpdated).toLocaleDateString()}</td>
                      <td>{new Date(request.expiresAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openUpdateModal(request)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Request Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <small className="text-muted">Request ID:</small>
                <div><code>{selectedRequest.requestId}</code></div>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add any notes about this update..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffDashboard;  