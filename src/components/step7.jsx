// src/components/step7.jsx
import React, { useEffect, useState } from 'react';

const Step7 = ({ formData, updateFormData, setStepValid }) => {
  const [reasonText, setReasonText] = useState(formData.step7?.explanation || '');

  useEffect(() => {
    updateFormData('step7', { explanation: reasonText });
    setStepValid(reasonText.trim() !== '');
  }, [reasonText]);

  return (
    <div className="step-body">
      <div className="step-header">
        ❓ Why are you suing this company or person? What happened? <span style={{ color: 'red' }}>*</span>
      </div>

      <div className="certification-fields">
        <div className="form-row">
          <label>
            Please be specific but note that there is a 500-character limit. You will get an opportunity to discuss the details at the hearing.
            <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            name="explanation"
            maxLength="500"
            rows="8"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Step7;
