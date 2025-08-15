import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AnimatePresence,motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

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

function RouteTransitions() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                 element={<Page><Home /></Page>} />
        <Route path="/dashboard"        element={<Page><Dashboard /></Page>} />
        <Route path="/team"             element={<Page><Team /></Page>} />
        <Route path="/small-claims-101" element={<Page><SmallClaims101 /></Page>} />
        <Route path="/coming-soon"      element={<Page><ComingSoon /></Page>} />
        <Route path="/terms-of-service" element={<Page><TermsOfService /></Page>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

/* tiny wrapper to fade/slide pages in/out */
const Page = ({ children }) => (
  <motion.main
    className="main-content"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.main>
);

function App() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <Router>
      <div className="app-shell">
        <ScrollToTop />

        <header className="navbar">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="ClaimRunner logo" />
            <span>ClaimRunner&nbsp;AI</span>
          </Link>

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
            <button
              className="login-link"
              onClick={() => { setMenuOpen(false); setShowModal(true); }}
            >
              Login
            </button>
          </nav>
        </header>

        {/* animated routes live INSIDE Router */}
        <RouteTransitions />

        <Footer />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Coming Soon</h2>
            <p>Our secure login portal is launching shortly.</p>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
