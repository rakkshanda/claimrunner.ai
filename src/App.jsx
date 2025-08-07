import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import Home from './pages/home';
import Team from './pages/Team';
import Dashboard from './Dashboard';
import SmallClaims101 from './pages/SmallClaims101';
import ComingSoon from './pages/ComingSoon';
import TermsOfService from './pages/TermsOfService';
import ScrollToTop from './pages/ScrollToTop';
import Footer from './pages/Footer';

import logo from './media/logo.png';

import './App.scss';
import './Navbar.scss';
import './Modal.scss';

function App() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <Router>
      <ScrollToTop />

      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="ClaimRunner logo" />
          <span>ClaimRunner&nbsp;AI</span>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <HashLink smooth to="/#features" onClick={() => setMenuOpen(false)}>Features</HashLink>
          <Link to="/team" onClick={() => setMenuOpen(false)}>Team</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Prototype</Link>
          <Link to="/small-claims-101" onClick={() => setMenuOpen(false)}>Small Claims 101</Link>
          <Link to="/terms-of-service" onClick={() => setMenuOpen(false)}>Terms of Service</Link>
          <button
            className="login-link"
            onClick={() => { setMenuOpen(false); setShowModal(true); }}
          >
            Login
          </button>
        </nav>
      </header>

      {/* Define all routes here */}
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/team"             element={<Team />} />
        <Route path="/small-claims-101" element={<SmallClaims101 />} />
        <Route path="/coming-soon"      element={<ComingSoon />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>

      <Footer />

      {/* Modal code stays the same */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Coming Soon</h2>
            <p>Our secure login portal is launching shortly.</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
