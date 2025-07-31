import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import Team from './pages/Team';
import Dashboard from './Dashboard';
import SmallClaims101 from './pages/SmallClaims101';
import Footer from './pages/Footer';
import './App.scss';
import './Navbar.scss';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      {/* ✅ Global Navbar */}
      <header className="navbar">
        <div className="logo">ClaimRunner AI</div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`menu ${menuOpen ? 'open' : ''}`}>

          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <Link to="/team" onClick={() => setMenuOpen(false)}>Team</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Prototype</Link>
          <Link to="/small-claims-101" onClick={() => setMenuOpen(false)}>Small Claims 101</Link>
          <a href="#" onClick={() => setMenuOpen(false)}>Login</a>
        </nav>
      </header>

      {/* Page Content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/small-claims-101" element={<SmallClaims101 />} />
      </Routes>

      {/* Global Footer */}
      <Footer />
    </Router>
  );
}

export default App;
