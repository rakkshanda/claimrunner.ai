import './SmallClaims101.scss';

const steps = [
  {
    title: "Check if you're Eligible",
    description:
      "Small claims is for financial disputes only, usually under $10,000 for individuals ($5,000 for businesses). You must file within a certain number of years from the incident, this is called the statute of limitations. Additionally, you must make sure to file with the correct court depending on where the incident occurred. This is known as the jurisdiction."
  },
  {
    title: "File your Claim",
    description:
      "You need to complete a form, usually called a “Notice of Small Claim” that lists the info of the person you are taking to court (the defendant), how much money you are asking for, and a short explanation. ClaimRunner will help you generate this automatically."
  },
  {
    title: "Serve the Defendant",
    description:
      "You must legally notify the person you are suing. This can be done by certified mail, process servers, a county sheriff/deputy, or someone else over 18 (but not you)."
  },
  {
    title: "Attempt Mediation",
    description:
      "Many courts require mediation first. It’s a meeting to try and settle things out of court. If you and the defendant come to an agreement in mediation, then you won’t need to go to court."
  },
  {
    title: "Prepare for Court",
    description:
      "Collect your evidence such as contracts, photos, messages, or anything else that supports your case. Practice explaining what happened."
  },
  {
    title: "Go to Trial",
    description:
      "You present your case in court. A judge will listen to both sides and make a decision. Be prepared, clear, and concise about what happened."
  },
  {
    title: "Receive Judgement",
    description:
      "If you win, the court will order the other party to pay. If they don’t, then you might need to take additional steps to collect the money. ClaimRunner can recommend some next steps if you are having trouble collecting."
  },
  {
    title: "Appeal (If allowed)",
    description:
      "If the case didn’t end the way you hoped, you may be able to appeal. This process can be complex and isn’t allowed in all jurisdictions. ClaimRunner can help you navigate the process!"
  }
];

function SmallClaims101() {
  return (
    <div className="claims101">
      <h1>Small Claims 101</h1>
      <h3 className="subhead">How Small Claims Works</h3>
      <p className="intro">
        Here is a step-by-step guide to understanding the small claims process.
        Every court is different, so be sure to check your local court’s rules.
        Or remove the guesswork and let ClaimRunner figure that out for you!
      </p>

      <div className="steps-vertical">
        {steps.map((step, index) => (
          <div className="step-block" key={index}>
            <h4>{step.title}</h4>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmallClaims101;
