// Footer.jsx
import { Link } from 'react-router-dom';
import './Footer.scss';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ClaimRunner AI. All rights reserved.</p>
        <div className="footer-policy">
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
