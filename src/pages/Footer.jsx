import './Footer.scss';

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} ClaimRunner.ai. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
