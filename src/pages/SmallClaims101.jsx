import { useState, useRef, useEffect } from 'react';
import './SmallClaims101.scss';

const steps = [
  { title: '1. Check if You’re Eligible',
    body: 'Small claims is for financial disputes only, usually under $10,000 for individuals ($5,000 for businesses). You must file within the statute of limitations and in the correct court jurisdiction.' },
  { title: '2. File Your Claim',
    body: 'Complete a “Notice of Small Claim” listing the defendant’s info, the amount you’re asking for, and a short explanation. ClaimRunner will help you generate this automatically.' },
  { title: '3. Serve the Defendant',
    body: 'You must legally notify the person you are suing—by certified mail, process server, county sheriff/deputy, or another adult (not you).' },
  { title: '4. Attempt Mediation',
    body: 'Many courts require mediation first. If you and the defendant settle, you won’t need to go to court.' },
  { title: '5. Prepare for Court',
    body: 'Collect evidence such as contracts, photos, or messages. Practice explaining what happened clearly and concisely.' },
  { title: '6. Go to Trial',
    body: 'Present your case. A judge listens to both sides and makes a decision.' },
  { title: '7. Receive Judgment',
    body: 'If you win, the court orders the other party to pay. If they don’t, you may need extra steps to collect. ClaimRunner can help.' },
  { title: '8. Appeal (If Allowed)',
    body: 'If the outcome isn’t what you hoped, you might be able to appeal. This can be complex and isn’t available in every jurisdiction.' },
];

export default function SmallClaims101() {
  const [idx, setIdx] = useState(0);
  const total = steps.length;

  const go = (n) => setIdx((p) => (p + n + total) % total);
  const set = (n) => setIdx(n);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // basic swipe
  const touch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = Math.abs(t.clientY - touch.current.y);
    if (Math.abs(dx) > 40 && dy < 60) go(dx < 0 ? 1 : -1);
  };

  return (
    <section className="claims101 claims101--carousel">
      <header className="claims101__head">
        <h1>Small Claims 101</h1>
      </header>

    

      {/* slider */}
      <div className="slider" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="slider__track"
          style={{ transform: `translateX(${idx * -100}%)` }}
          aria-live="polite"
        >
          {steps.map(({ title, body }, i) => (
            <article className="slide" key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${total}`}>
              <div className="slide__card">
                <h2 className="slide__title">{title}</h2>
                <p className="slide__body">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="slider__controls">
        <button className="btn-ghost" onClick={() => go(-1)} aria-label="Previous step">← </button>
        <div className="dots" role="tablist" aria-label="Steps">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === idx ? 'active' : ''}`}
              role="tab"
              aria-selected={i === idx}
              onClick={() => set(i)}
              title={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={() => go(1)} aria-label="Next step"> →</button>
      </div>
    </section>
  );
}
