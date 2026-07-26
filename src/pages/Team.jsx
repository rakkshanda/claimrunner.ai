import { useState } from 'react';
import './Team.scss';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';

import RakshandaImg from '../media/team/Rakshanda.jpeg';
import ColeImg from '../media/team/Cole.jpeg';
import AnjaliImg from '../media/team/Anjali.jpg';
import KhoaImg from '../media/team/Khoa.jpeg';
import SamridhImg from '../media/team/Samridh.jpeg';
import NathanImg from '../media/team/Nathan.jpeg';

const FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfqLsoqoSaGIfPbeMskNUSr8vJqcmV2qfpEJFc5TnWcpK7K3g/formResponse';

const ENTRY = {
  name:    'entry.1535527815',
  email:   'entry.465955779',
  message: 'entry.1193656108',
  signup:  'entry.98446800',
};

const firstRow = [
  { name: 'Cole DuBois', role: 'CEO', img: ColeImg, linkedin: 'https://www.linkedin.com/in/coledubois/', email: 'contactcole@gmail.com' },
  { name: 'Nathan Lee', role: 'Strategy Lead', img: NathanImg, linkedin: 'https://www.linkedin.com/in/nathanleeuw/', email: 'nathanlee00873@gmail.com' },
  { name: 'Anjali Abhilash', role: 'Technical Associate', img: AnjaliImg, linkedin: 'https://www.linkedin.com/in/anjali-abhilash/', email: 'aabhil@uw.edu' }
];

const secondRow = [
  { name: 'Rakshanda', role: 'Data & Analytics Lead', img: RakshandaImg, linkedin: 'https://www.linkedin.com/in/rakkshanda/', email: 'rakkshanda.b@gmail.com' },
  { name: 'Khoa Luong', role: 'AI Engineer', img: KhoaImg, linkedin: 'https://www.linkedin.com/in/khoaluong99/', email: 'khoal@uw.edu' },
  { name: 'Samridh B.', role: 'Product Lead', img: SamridhImg, linkedin: 'https://www.linkedin.com/in/samridhb/', email: 'samridhb@gmail.com' }
];

function TeamCard({ name, role, img, linkedin, email }) {
  return (
    <article className="card">
      <div className="card__photo-wrap">
        <img className="card__photo" src={img} alt={`${name} headshot`} loading="lazy" />
      </div>
      <div className="card__reveal">
        <h3>{name}</h3>
        <p className="card__role">{role}</p>
        <div className="links" aria-label={`${name} contact links`}>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`}>
            <FaLinkedin size = {26}/>
          </a>
          <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
            <FaEnvelope size = {26}/>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Team() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const submitContact = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      signup: form.signup.checked,
    };

    if (!data.email || !data.message) {
      setStatus({ type: 'err', msg: 'Please provide at least Email and Message.' });
      return;
    }

    try {
      setSending(true);
      setStatus(null);

      const fd = new FormData();
      fd.set(ENTRY.name, data.name);
      fd.set(ENTRY.email, data.email);
      fd.set(ENTRY.message, data.message);
      fd.set(ENTRY.signup, data.signup ? 'Yes' : 'No');

      await fetch(FORM_ACTION, {
        method: 'POST',
        body: fd,
        mode: 'no-cors',
      });

      setStatus({ type: 'ok', msg: 'Thanks! Your message has been sent.' });
      form.reset();
    } catch {
      setStatus({ type: 'err', msg: 'Could not send right now. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="team" aria-labelledby="team-title">
      <div className="team-hero">
        <h1 id="team-title">Meet the Team</h1>

        <div className="team-rows">
          <div className="team-row three-cols">
            {firstRow.map((person) => (
              <TeamCard key={person.name} {...person} />
            ))}
          </div>

          <div className="team-row four-cols">
            {secondRow.map((person) => (
              <TeamCard key={person.name} {...person} />
            ))}
          </div>
        </div>
      </div>

      <div className="contact-card" role="form" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact Us</h2>
        <div className="divider" aria-hidden="true" />
        <p className="lede">Drop us a line!</p>

        <form className="contact-form" onSubmit={submitContact}>
          <label className="sr-only" htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" placeholder="Name" />

          <label className="sr-only" htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" required placeholder="Email*" />

          <label className="sr-only" htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows="6" required placeholder="Message" />

          <label className="checkbox">
            <input type="checkbox" name="signup" />
            <span>Sign up for our email list for updates, promotions, and more.</span>
          </label>

          <button type="submit" className="send-btn" disabled={sending}>
            {sending ? 'SENDING…' : 'SEND'}
          </button>

          {status && (
            <div
              className={`contact-status ${status.type}`}
              role={status.type === 'err' ? 'alert' : 'status'}
            >
              {status.msg}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}