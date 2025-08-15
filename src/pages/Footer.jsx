import './Footer.scss';
import logo from '../media/logo.png';   // ← adjust if your logo file lives elsewhere

function Footer() {
  return (
    <footer className="footer">
  
      {/* ─────────────────── bottom row ─────────────────── */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ClaimRunner&nbsp;AI. All rights reserved.</p>
        <div className="footer-policy">
          {/* <a href="#">Privacy Policy</a> */}
        <a href="/terms-of-service">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
