import './SmallClaims101.scss';

const steps = [
  {
    title: "Check if you're Eligible",
    description: "Small claims is for financial disputes only, usually under $10,000 for individuals ($5,000 for businesses)..."
  },
  {
    title: "File your Claim",
    description: "Complete a form usually called a 'Notice of Small Claim' with details of the defendant, claim amount, and a short explanation..."
  },
  {
    title: "Serve the Defendant",
    description: "You must legally notify the person you are suing. Certified mail, sheriff, or process server are typical options..."
  },
  {
    title: "Attempt Mediation",
    description: "Many courts require mediation. If you and the defendant come to an agreement, you won’t need to go to court..."
  },
  {
    title: "Prepare for Court",
    description: "Gather contracts, photos, texts — anything that supports your case. Practice telling your story clearly..."
  },
  {
    title: "Go to Trial",
    description: "Explain your case in front of a judge. Be clear, calm, and concise..."
  },
  {
    title: "Receive Judgement",
    description: "If you win, the court will order the other party to pay. ClaimRunner can help if they don’t..."
  },
  {
    title: "Appeal (If allowed)",
    description: "If you lose, you may be able to appeal. Rules vary — ClaimRunner can guide you..."
  }
];

function SmallClaims101() {
  return (
    <div className="claims101">
      <h1>Small Claims 101</h1>
      <p className="intro">
        Here's a step-by-step guide to understanding the small claims process.
        Every court is different — check your local court's rules, or let ClaimRunner figure it out for you!
      </p>
      <div className="steps-list">
        {steps.map((step, i) => (
          <div key={i} className="step-card">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmallClaims101;
