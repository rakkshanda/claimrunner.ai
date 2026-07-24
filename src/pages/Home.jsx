import { useNavigate } from 'react-router-dom';
import './Home.scss';
import heroImage from '../media/homep.png';
import missionImage from '../media/mission.svg';
import {
  ClipboardCheck,
  Gavel,
  MessageCircle,
  Mic,
  FileText,
} from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Judy, Our Claim Agent',
      desc: 'Answer a few questions and let Judy help you build a winning case, from intake to filing.',
      icon: MessageCircle,
      featured: true,
    },
    {
      title: 'Legal Form Generator',
      desc: 'Share your answers and we\u2019ll prepare your legal forms, ready for download or filing.',
      icon: FileText,
    },
    {
      title: 'Eligibility Checker',
      desc: 'See if your case meets the requirements to file. Try it for free in King County, WA!',
      icon: ClipboardCheck,
    },
    {
      title: 'Trial Prep & Simulator',
      desc: 'Practice answering questions and presenting evidence for your hearing.',
      icon: Gavel,
    },
    {
      title: 'Talk-to-Claim',
      desc: 'Tell our AI your story, and it will turn your words into usable claim details.',
      icon: Mic,
    },
    
  ];

  const handleFeatureClick = (title) => {
    if (title === 'Legal Form Generator') {
      navigate('/prototype');
    }
    else if (title === 'Eligibility Checker') {
      navigate('/dashboard');
    } 
    else {
      navigate('/coming-soon');
    }
  };

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <h1 id="hero-title" className="hero__title">
            Making Small Claims <br />
            Easier for Everyone
          </h1>
          <p className="hero__text">
            ClaimRunner makes it easy to file and manage small claims. Our guided tools help you
            understand your case, prepare and file your claim, and reach a resolution faster.
          </p>

          <div className="hero__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/dashboard')}
            >
              Check my eligibility
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/small-claims-101')}
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <img src={heroImage} alt="" className="hero__image" />
        </div>
      </section>
      {/* Disclaimer Box */}
        <div className="disclaimer-container">
          <div className="disclaimer-box">
            <div className="disclaimer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(217 119 6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="disclaimer-content">
              <strong>Important Legal Disclaimer</strong>
              <p>
                This platform is provided for informational purposes only and does not
                constitute professional legal advice. The results are based on general
                guidelines and your specific situation may require additional legal
                considerations. For specific legal advice, please consult with a qualified attorney.
              </p>
            </div>
          </div>
        </div>

      {/* Features */}
      <section className="features" id="features" aria-labelledby="features-title">
        <header className="section-head">
          <h2 id="features-title" className="section-head__title">Your Claim. Made Simple.</h2>
          <p className="section-head__sub">
            Our platform uses AI to guide you and remove the guesswork from filing a small claim.
          </p>
        </header>

        <ul className="feature-grid">
          {features.map(({ title, desc, icon: Icon, featured }) => (
            <li
              key={title}
              className={`feature-item${featured ? ' feature-item--featured' : ''}`}
            >
              <button
                type="button"
                className={`feature${featured ? ' feature--featured' : ''}`}
                onClick={() => handleFeatureClick(title)}
                aria-label={title}
              >
                <span className="feature__icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="feature__title">{title}</h3>
                <p className="feature__desc">{desc}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Mission */}
      <section className="mission" aria-labelledby="mission-title">
        <h2 id="mission-title" className="mission__title">Our Mission</h2>
        <h3 className="mission__kicker">Expanding Access to Justice</h3>
        <p className="mission__text">
          ClaimRunner AI's mission is simple: to expand access to justice through information and
          technology. We're building an AI-powered platform designed to guide anyone through the
          small claims process, from start to finish. For those who have found the legal system
          confusing or out of reach, we aim to make the process more understandable and more
          accessible.
        </p>
        <img src={missionImage} alt="Mission illustration" className="mission__icon" />
      </section>
    </main>
  );
}

export default Home;