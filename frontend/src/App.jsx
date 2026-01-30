import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import { FaHome, FaFileAlt, FaSearch, FaSignInAlt, FaShieldAlt } from 'react-icons/fa';
import Home from './components/Home';
import PublicRequestForm from './components/Publicrequestform';
import RequestStatusChecker from './components/Requeststatuschecker';
import Login from './components/Login';
import StaffDashboard from './components/Staffdashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <Router>
      <div className="app-modern">
        {/* Navigation Bar */}
        <Navbar expand="lg" className="navbar-modern">
          <Container>
            <Navbar.Brand href="/" className="brand-modern">
              <FaShieldAlt className="brand-icon" />
              <span>Barangay System</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/" className="nav-link-modern">
                  <FaHome /> Home
                </Nav.Link>
                <Nav.Link href="/request" className="nav-link-modern">
                  <FaFileAlt /> Request
                </Nav.Link>
                <Nav.Link href="/status" className="nav-link-modern">
                  <FaSearch /> Status
                </Nav.Link>
                {!isAuthenticated && (
                  <Nav.Link href="/login" className="nav-link-modern">
                    <FaSignInAlt /> Staff
                  </Nav.Link>
                )}
                {isAuthenticated && (
                  <Nav.Link href="/dashboard" className="nav-link-modern active">
                    Dashboard
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Routes */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<PublicRequestForm />} />
            <Route path="/status" element={<RequestStatusChecker />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StaffDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer-modern">
          <Container>
            <Row className="footer-top">
              <Col md={4} className="footer-col">
                <h5>Barangay System</h5>
                <p>Privacy-first document request platform for barangay services</p>
              </Col>
              <Col md={4} className="footer-col">
                <h5>Quick Links</h5>
                <div className="footer-links">
                  <a href="/">Home</a>
                  <a href="/request">Request Document</a>
                  <a href="/status">Check Status</a>
                </div>
              </Col>
              <Col md={4} className="footer-col">
                <h5>Privacy Notice</h5>
                <p className="privacy-text">
                  Personal data is never stored permanently. All information is automatically deleted after 7 days.
                </p>
              </Col>
            </Row>
            <div className="footer-bottom">
              <p>© 2025 Barangay Management API by Jennilyn. All rights reserved.</p>
            </div>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;