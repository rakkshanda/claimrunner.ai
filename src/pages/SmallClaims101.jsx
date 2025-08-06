import { useState } from 'react';
import './SmallClaims101.scss';

function SmallClaims101() {
  const [openIdx, setOpenIdx] = useState(null);

  const steps = [
    {
      title: '1. Check if You’re Eligible',
      body:
        'Small claims is for financial disputes only, usually under $10,000 for individuals ($5,000 for businesses). You must file within the statute of limitations and in the correct court jurisdiction.',
    },
    {
      title: '2. File Your Claim',
      body:
        'Complete a “Notice of Small Claim” listing the defendant’s info, the amount you’re asking for, and a short explanation. ClaimRunner will help you generate this automatically.',
    },
    {
      title: '3. Serve the Defendant',
      body:
        'You must legally notify the person you are suing—by certified mail, process server, county sheriff/deputy, or another adult (not you).',
    },
    {
      title: '4. Attempt Mediation',
      body:
        'Many courts require mediation first. If you and the defendant settle, you won’t need to go to court.',
    },
    {
      title: '5. Prepare for Court',
      body:
        'Collect evidence such as contracts, photos, or messages. Practice explaining what happened clearly and concisely.',
    },
    {
      title: '6. Go to Trial',
      body:
        'Present your case. A judge listens to both sides and makes a decision.',
    },
    {
      title: '7. Receive Judgment',
      body:
        'If you win, the court orders the other party to pay. If they don’t, you may need extra steps to collect. ClaimRunner can help.',
    },
    {
      title: '8. Appeal (If Allowed)',
      body:
        'If the outcome isn’t what you hoped, you might be able to appeal. This can be complex and isn’t available in every jurisdiction.',
    },
  ];

  return (
    <div className="small-claims">
      <h1>Small Claims 101</h1>

      <div className="step-list">
        {steps.map(({ title, body }, i) => {
          const open = openIdx === i;
          return (
            <div
              key={i}
              className={`step-card ${open ? 'open' : ''}`}
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <div className="step-headers">{title}</div>
              <div className="step-body">{body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SmallClaims101;
