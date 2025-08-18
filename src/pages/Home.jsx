import { useNavigate } from 'react-router-dom';
import './Home.scss';
import heroImage from '../media/homep.png';
import missionImage from '../media/mission.svg';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'E-file',
      desc:
        'Submit your claim through our platform when courts allow.',
    },
  
    {
      title: 'Eligibility Checker',
      desc:
        'See if your case meets the requirements to file. Try it for free in King County, WA!',
    },  {
      title: 'Trial Prep & Simulator',
      desc:
        'Practice answering questions and presenting evidence for your hearing.',
    },
    {
      title: 'Judy, Our Claim Agent',
      desc:
        'Answer a few questions and let Judy help you build a winning case.',
    },
    {
      title: 'Talk-to-Claim',
      desc:
        'Tell our AI your story, and it will turn your words into usable claim details.',
    },
    {
      title: 'Legal Form Generator',
      desc:
        'Share your answers and we’ll prepare your legal forms, ready for download or filing.',
    },
  ];

  const handleFeatureClick = (title) => {
    if (title === 'Eligibility Checker') {
      navigate('/dashboard');
    } else {
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
        </div>

        <div className="hero__visual" aria-hidden="true">
          <img src={heroImage} alt="" className="hero__image" />
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features" aria-labelledby="features-title">
        <header className="section-head">
          <h2 id="features-title" className="section-head__title">Your Claim. Made Simple.</h2>
          <p className="section-head__sub">
            Our platform uses AI to guide you and remove the guesswork from filing a small claim.
          </p>
        </header>

        <ul className="feature-grid" >
          {features.map(({ title, desc }, i) => (
            <li key={title} className="feature-item">
              <button
                type="button"
                className="feature"
                onClick={() => handleFeatureClick(title)}
                aria-label={title}
              >
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
          ClaimRunner AI’s mission is simple: to expand access to justice through information and
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
