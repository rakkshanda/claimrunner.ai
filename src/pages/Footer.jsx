import './Footer.scss';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          
          <p>
            Making small claims faster, simpler, and more accessible for everyone.
          </p>
        </div>

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

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ClaimRunner AI. All rights reserved.</p>
        <div className="footer-policy">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
