// src/pages/ComingSoon.jsx
import { Link } from 'react-router-dom';
import './ComingSoon.scss';

export default function ComingSoon() {
  return (
    <section className="comingsoon">
      <h1>Coming Soon </h1>
      <p>We’re polishing this feature right now. Check back shortly!</p>
      <Link to="/">← Back to Home</Link>
    </section>
  );
}
