import React from 'react';
import '../App.scss'; // Assuming SCSS is in App.scss for now

const Step8 = ({ formData, updateFormData }) => {
  const certification = formData.step8 || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('step8', { [name]: value });
  };

  const isComplete =
    certification.signature?.trim() &&
    certification.location?.trim() &&
    certification.date?.trim();

    const handleSubmit = () => {
      const json = JSON.stringify(formData, null, 2);
      console.log('✅ Final Form JSON:', json);
    
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
    
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claimrunner-form.json';
      a.click();
    };

  return (
    <div className="step-body">
      <div className="step-header">📝 Certification</div>
      <div className="step-content certification-form">
        <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          I declare under penalty of perjury under the laws of the state of Washington that the foregoing is true and correct.
        </p>

        <div className="certification-row">
          <label htmlFor="signature">
            Signature<span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="signature"
            name="signature"
            value={certification.signature || ''}
            onChange={handleChange}
          />
        </div>

        <div className="certification-row">
          <label htmlFor="location">
            City and State where document is signed<span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={certification.location || ''}
            onChange={handleChange}
          />
        </div>

        <div className="certification-row">
          <label htmlFor="date">
            Date<span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={certification.date || ''}
            onChange={handleChange}
          />
        </div>

        <p className="certification-warning">
          This is the last page of the interview,{' '}
          <span>
            please take time to go back and review all the information entered in each tab and confirm it is correct.
          </span>{' '}
          If you believe all the information is correct, please click the "Proceed" button at this time to submit your
          filing and pay for your case. Thank you!
        </p>

        <button
          className="certification-proceed-btn"
          onClick={handleSubmit}
          disabled={!isComplete}
        >
          🔵 Proceed
        </button>
      </div>
    </div>
  );
};

export default Step8;
