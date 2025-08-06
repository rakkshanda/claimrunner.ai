import './Footer.scss';
import logo from '../media/logo.png';   // ← adjust if your logo file lives elsewhere

function Footer() {
  return (
    <footer className="footer">
      {/* ──────────────────── top row ──────────────────── */}
      <div className="footer-top">
        {/* Brand block (logo + word-mark + tagline) */}
        <div className="footer-brand">
          <div className="brand-logo">
            <img src={logo} alt="ClaimRunner AI logo" />
            <span className="wordmark">ClaimRunner&nbsp;AI</span>
          </div>

          {/* Tagline (sits to the right of the brand logo on desktop, below on mobile) */}
          <p className="tagline">
            Making small claims faster, simpler, and more accessible for everyone.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-links">
          <div>
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Eligibility Checker</a></li>
              <li><a href="#">Claim Builder</a></li>
              <li><a href="#">Trial Prep</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="/team">Team</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─────────────────── bottom row ─────────────────── */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ClaimRunner&nbsp;AI. All rights reserved.</p>
        <div className="footer-policy">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
