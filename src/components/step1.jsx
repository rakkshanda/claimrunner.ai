// src/components/step1.jsx
import React from 'react';

const Step1 = () => {
  return (
    <div className="step-body">
      <div className="step-header">📒 Hello!</div>
      <div className="step-message yellow-box">
        <p>
          We understand you wish to initiate a Small Claim case. This program will help you to complete a Notice of Small Claim form and file your case by conducting an interview, that is, by providing questions for you to answer in plain language. This program will not provide legal advice.
        </p>

        <p>
          <strong>More information</strong> on the Small Claims process is available on our website:
          <ul>
            <li><a href="#">Small Claims</a></li>
            <li><a href="#">How to Prepare, File and Serve a Claim</a></li>
          </ul>
        </p>

        <p>
          <strong>Are you ready to begin?</strong> Please click the "Next Step" button to move to the next section to review acknowledgments and begin the interview. All fields marked with an asterisk * are required. When you are finished with the questions and are ready to file, select <strong>'Proceed'</strong> at the bottom of the page. This will route you to a new page to pay the $50.00 filing fee.
        </p>

        <p className="warning">
          If you receive a red error or yellow warning after you click the Proceed button, you will need to resolve the data issue and then upload your documents again, even if the file names still appear.
        </p>
      </div>
    </div>
  );
};

export default Step1;
