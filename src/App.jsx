import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/home';
import Team from './pages/Team';
import Dashboard from './Dashboard';
import SmallClaims101 from './pages/SmallClaims101';
import Footer from './pages/Footer';
import ComingSoon from './pages/ComingSoon'; 
import { HashLink } from 'react-router-hash-link';
import ScrollToTop from './pages/ScrollToTop';  

import logo from './media/logo.png';

import './App.scss';
import './Navbar.scss';
import './Modal.scss';      // <— stylesheet for the pop-up

function App() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showModal, setShowModal] = useState(false);   // modal state

  return (
    <Router>
      <ScrollToTop />      
      {/* ───────────── NAVBAR ───────────── */}
      <header className="navbar">
        {/* logo + word-mark */}
        <div className="logo">
          <img src={logo} alt="ClaimRunner logo" />
          <span>ClaimRunner&nbsp;AI</span>
        </div>

        {/* hamburger button (mobile) */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* nav links */}
        <nav className={`menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/"                 onClick={() => setMenuOpen(false)}>Home</Link>
<HashLink smooth to="/#features">Features</HashLink>
          <Link to="/team"             onClick={() => setMenuOpen(false)}>Team</Link>
          <Link to="/dashboard"        onClick={() => setMenuOpen(false)}>Prototype</Link>
          <Link to="/small-claims-101" onClick={() => setMenuOpen(false)}>Small Claims 101</Link>

          {/* Login triggers modal */}
          <button
            className="login-link"
            onClick={() => {
              setMenuOpen(false);
              setShowModal(true);
            }}
          >
            Login
          </button>
        </nav>
      </header>

      {/* ───────────── ROUTES ───────────── */}
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/team"             element={<Team />} />
        <Route path="/small-claims-101" element={<SmallClaims101 />} />
        <Route path="/coming-soon" element={<ComingSoon />} />  
      </Routes>

      <Footer />

      {/* ───────────── “COMING SOON” MODAL ───────────── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}          // click backdrop to close
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}        // prevent close when clicking inside
          >
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
