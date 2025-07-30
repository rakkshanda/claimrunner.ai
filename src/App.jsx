import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Team from './pages/Team';
import Dashboard from './Dashboard';
import SmallClaims101 from './pages/SmallClaims101';
import Footer from './pages/Footer'; // ✅ Correct import as a React component
import './App.scss';
import './pages/Navbar.scss'; // ✅ Assumes Navbar.scss is in /src

function App() {
  return (
    <Router>
      {/* ✅ Global Navbar */}
      <header className="navbar">
        <div className="logo">ClaimRunner AI</div>
        <nav>
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <Link to="/team">Team</Link>
          <Link to="/dashboard">Prototype</Link>
          <Link to="/small-claims-101">Small Claims 101</Link>
          <a href="#">Login</a>
        </nav>
      </header>

      {/* Page Content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/small-claims-101" element={<SmallClaims101 />} />
      </Routes>

      {/* ✅ Global Footer */}
      <Footer />
    </Router>
  );
}

export default App;
