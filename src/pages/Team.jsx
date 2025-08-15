import React, { useState } from 'react';
import './Team.scss';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';

import RakshandaImg from '../media/team/Rakshanda.jpeg';
import SamImg from '../media/team/Sam.jpeg';
import ColeImg from '../media/team/Cole.jpeg';
import RuiqiImg from '../media/team/Ruiqi.jpeg';
import KhoaImg from '../media/team/Khoa.jpeg';
import SamridhImg from '../media/team/Samridh.jpeg';
import NathanImg from '../media/team/Nathan.jpeg';

// ---- Your Google Apps Script endpoint ----
const CONTACT_URL = 'https://script.google.com/macros/s/AKfycbzpp9mNLOSxhbsgP5Ie8PUAxJ9eHggIbsH5Cgbze-ZZM0FH7RlgJWpRCm4BsZdfLPCU/exec';

// Google Forms direct-post config
const FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfqLsoqoSaGIfPbeMskNUSr8vJqcmV2qfpEJFc5TnWcpK7K3g/formResponse';

// Map your form fields to Google Form entry IDs
// If any column lands in the wrong place, just swap these IDs.
const ENTRY = {
  name:    'entry.1535527815',
  email:   'entry.465955779',
  message: 'entry.1193656108',
  signup:  'entry.98446800',
};


const firstRow = [
  { name: 'Sam Mata', img: SamImg, linkedin: 'https://www.linkedin.com/in/sam-mata-3048108b/', email: 'sam@claimrunner.ai' },
  { name: 'Nathan Lee', img: NathanImg, linkedin: 'https://www.linkedin.com/in/nathanleeuw/', email: 'nathanlee00873@gmail.com' },
  { name: 'Ruiqi Wei', img: RuiqiImg, linkedin: 'https://www.linkedin.com/in/ruiqiwei/', email: 'ruwei@uw.edu' }
];

const secondRow = [
  { name: 'Cole DuBois', img: ColeImg, linkedin: 'https://www.linkedin.com/in/coledubois/', email: 'contactcole@gmail.com' },
  { name: 'Rakshanda B.', img: RakshandaImg, linkedin: 'https://www.linkedin.com/in/rakkshanda/', email: 'rakksh@uw.edu' },
  { name: 'Khoa Luong', img: KhoaImg, linkedin: 'https://www.linkedin.com/in/khoaluong99/', email: 'khoal@uw.edu' },
  { name: 'Samridh B.', img: SamridhImg, linkedin: 'https://www.linkedin.com/in/samridhb/', email: 'samridhb@gmail.com' }
];

export default function Team() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'err', msg: string }
  const [confirming, setConfirming] = useState(false);
  const [sentPreview, setSentPreview] = useState('');
 const submitContact = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    signup: form.signup.checked, // boolean
  };

  if (!data.email || !data.message) {
    setStatus({ type: 'err', msg: 'Please provide at least Email and Message.' });
    return;
  }

  try {
    setSending(true);
    setStatus(null);

    // Build payload for Google Forms (no headers → no preflight)
    const fd = new FormData();
    fd.set(ENTRY.name, data.name);
    fd.set(ENTRY.email, data.email);
    fd.set(ENTRY.message, data.message);
    fd.set(ENTRY.signup, data.signup ? 'Yes' : 'No'); // short answer field

    await fetch(FORM_ACTION, {
      method: 'POST',
      body: fd,
      mode: 'no-cors', // opaque response is expected
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
      <h1 id="team-title">Meet the Team</h1>

      {/* First Row */}
      <div className="team-row three-cols">
        {firstRow.map(({ name, img, linkedin, email }) => (
          <article key={name} className="card">
            <img src={img} alt={`${name} headshot`} loading="lazy" />
            <h3>{name}</h3>
            <div className="links" aria-label={`${name} contact links`}>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`}>
                <FaLinkedin />
              </a>
              <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
                <FaEnvelope />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Second Row */}
      <div className="team-row four-cols">
        {secondRow.map(({ name, img, linkedin, email }) => (
          <article key={name} className="card">
            <img src={img} alt={`${name} headshot`} loading="lazy" />
            <h3>{name}</h3>
            <div className="links" aria-label={`${name} contact links`}>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`}>
                <FaLinkedin />
              </a>
              <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
                <FaEnvelope />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Contact Us Card */}
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

          <button type="submit" className="send-btn" disabled={sending || confirming}>
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
          {sentPreview && (
  <div className="sent-preview" role="status" aria-live="polite">
    <strong>Message sent:</strong>
    <div className="sent-text">{sentPreview}</div>
  </div>
)}

        </form>
      </div>
    </section>
  );
}
