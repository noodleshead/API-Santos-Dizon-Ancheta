import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaFileAlt, FaSearch, FaShieldAlt, FaClock, FaTrash, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-modern">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8} className="text-center">
              <div className="privacy-badge-modern">
                <FaShieldAlt />
                <span>Privacy-First System</span>
              </div>
              <h1 className="hero-title">
                Barangay Document Request System
              </h1>
              <p className="hero-subtitle">
                Request and track your barangay documents online with complete privacy protection
              </p>
              <div className="hero-actions">
                <Button 
                  size="lg" 
                  className="btn-primary-modern"
                  onClick={() => navigate('/request')}
                >
                  <FaFileAlt />
                  Request Document
                </Button>
                <Button 
                  size="lg" 
                  className="btn-outline-modern"
                  onClick={() => navigate('/status')}
                >
                  <FaSearch />
                  Check Status
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Privacy Features */}
      <section className="privacy-section">
        <Container>
          <div className="section-header">
            <h2>Privacy Protection</h2>
            <p>Your data security is our top priority</p>
          </div>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <div className="feature-card">
                <div className="feature-icon shield">
                  <FaShieldAlt />
                </div>
                <h3>No Storage</h3>
                <p>Personal data is never stored in our database</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="feature-card">
                <div className="feature-icon clock">
                  <FaClock />
                </div>
                <h3>Temporary</h3>
                <p>Data used only during active transactions</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="feature-card">
                <div className="feature-icon trash">
                  <FaTrash />
                </div>
                <h3>Auto-Delete</h3>
                <p>All data removed after 7 days automatically</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="feature-card">
                <div className="feature-icon user">
                  <FaUserShield />
                </div>
                <h3>Minimal Data</h3>
                <p>Only essential information is required</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Available Documents */}
      <section className="documents-section">
        <Container>
          <div className="section-header">
            <h2>Available Documents</h2>
            <p>Choose from our range of barangay services</p>
          </div>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Barangay Clearance</h3>
                <p>Certificate of good standing in the barangay</p>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Certificate of Residency</h3>
                <p>Proof of residence in the barangay</p>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Certificate of Indigency</h3>
                <p>For financial assistance and subsidies</p>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Business Permit</h3>
                <p>Authorization to operate a business</p>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Certificate of Good Moral</h3>
                <p>Character reference certificate</p>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="document-card">
                <h3>Community Tax</h3>
                <p>Annual community tax certificate</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="process-section">
        <Container>
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to get your documents</p>
          </div>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Submit Request</h3>
                <p>Fill out the online form with required information</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Save Request ID</h3>
                <p>Receive a unique ID to track your request</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Track Status</h3>
                <p>Monitor progress using your Request ID</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="process-step">
                <div className="step-number">4</div>
                <h3>Claim Document</h3>
                <p>Pick up your document at the Barangay Hall</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;