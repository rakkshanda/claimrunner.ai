import { useNavigate } from 'react-router-dom';
import './Home.scss';
import heroImage from '../media/homep.png';
import missionImage from '../media/mission.svg';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Claim Agent',
      desc:
        'Your personal guide. Answer a few questions and let our Claim Builder Agent help complete your small claims paperwork.',
    },
    {
      title: 'Eligibility Checker',
      desc:
        'Know before you file. We will check your case’s amount, jurisdiction, and deadlines to confirm your eligibility to file.',
    },
    {
      title: 'Talk to Claim',
      desc:
        'Prefer to explain things out loud? Talk to our AI, and it will translate your words into usable claim info.',
    },
    {
      title: 'Legal Form Generator',
      desc:
        'Tired of paperwork? We will automatically fill out your forms based on your answers.',
    },
    {
      title: 'E-file',
      desc:
        'When courts allow, skip the trip and submit your claims directly through our platform.',
    },
    {
      title: 'Trial Prep & Simulator',
      desc:
        'Nervous to go in front of a judge? Our trial simulator will help you rehearse your case and be prepared for trial.',
    },
  ];

  return (
    <div className="home">
      {/* Landing Zone */}
      <section className="landing">
        <div className="landing-content">
          <h1>
            Making Small Claims <br />
            Easier for Everyone
          </h1>
          <p>
            ClaimRunner makes it easy to file and manage small claims. Our guided tools help you
            understand your case, prepare and file your claim, and reach a resolution faster.
          </p>
          <img src={heroImage} alt="Justice illustration" />
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <h2>Your Claim. Made Simple.</h2>
        <p className="subhead">
          Our platform uses AI to guide you and remove the guesswork from filing a small claim.
        </p>

        <div className="feature-grid">
          {features.map(({ title, desc }, i) => (
            <div
              key={i}
              className="feature-card"
              role="button"
              tabIndex={0}
              onClick={() =>
                title === 'Eligibility Checker'
                  ? navigate('/dashboard')
                  : navigate('/coming-soon')
              }
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (title === 'Eligibility Checker'
                  ? navigate('/dashboard')
                  : navigate('/coming-soon'))
              }
            >
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mission">
        <h2>Our Mission</h2>
        <h4>Expanding Access to Justice</h4>
        <p>
          ClaimRunner AI’s mission is simple: to expand access to justice through information and
          technology. We're building an AI-powered platform designed to guide anyone through the
          small claims process, from start to finish. For those who have found the legal system
          confusing or out of reach, we aim to make the process more understandable and more
          accessible.
        </p>
        <img src={missionImage} alt="Mission illustration" />
      </section>
    </div>
  );
}

export default Home;
