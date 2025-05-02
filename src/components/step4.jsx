import React, { useEffect } from 'react';

const Step4 = ({ formData, updateFormData, setStepValid }) => {
  const caseInfo = formData.step4 || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData('step4', { [name]: value });
  };

  useEffect(() => {
    const allFieldsFilled =
      caseInfo.location &&
      caseInfo.reason &&
      caseInfo.amount &&
      caseInfo.dueDate;

    setStepValid(!!allFieldsFilled);
  }, [caseInfo, setStepValid]);

  return (
    <div className="step-body">
      <div className="step-header">📝 Let's begin with some basic case information <span style={{ color: 'red' }}>*</span></div>
      <div className="certification-fields">
        <div className="form-row">
          <label>Where would you like to file your case?<span style={{ color: 'red' }}>*</span></label>
          <select name="location" value={caseInfo.location || ''} onChange={handleChange}>
            <option value="">Select location</option>
            <option value="Seattle">Seattle</option>
            <option value="Kent">Kent</option>
            <option value="Bellevue">Bellevue</option>
            <option value="Redmond">Redmond</option>
          </select>
        </div>

        <div className="form-row">
          <label>What is the reason for your filing?<span style={{ color: 'red' }}>*</span></label>
          <select name="reason" value={caseInfo.reason || ''} onChange={handleChange}>
            <option value="">Select reason</option>
            <option value="Unpaid Loan">Unpaid Loan</option>
            <option value="Property Damage">Property Damage</option>
            <option value="Deposit Dispute">Deposit Dispute</option>
            <option value="Wage Claim">Wage Claim</option>
          </select>
        </div>

        <div className="form-row">
          <label>How much money are seeking to recoup?<span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            name="amount"
            value={caseInfo.amount || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>When was the money due and owing?<span style={{ color: 'red' }}>*</span></label>
          <input
            type="date"
            name="dueDate"
            value={caseInfo.dueDate || ''}
            onChange={handleChange}
          />
        </div>

        <p style={{ fontWeight: 'bold' }}>
          ***Please note that although you can select to file your case at any of our court locations,
          <span style={{ color: 'red' }}> your hearings might be set at a different location </span>
          for mediation or any other hearing type depending on the court's availability.***
        </p>
        <p>The packet mailed to you will indicate the location of your hearing and how to appear for that hearing.</p>
      </div>
    </div>
  );
};

export default Step4;
