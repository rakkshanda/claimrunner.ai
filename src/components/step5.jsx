// src/components/step5.jsx
import React, { useEffect, useState } from 'react';

const Step5 = ({ formData, updateFormData, setStepValid }) => {
  const [fields, setFields] = useState({
    companyName: '',
    lastName: '',
    firstName: '',
    middleName: '',
    nameSuffix: '',
    interpreter: '',
    language: '',
    addressType: '',
    address1: '',
    address2: '',
    zip: '',
    city: '',
    state: '',
    county: '',
    country: '',
    email: '',
    phoneType: '',
    phoneNumber: '',
    extension: '',
    ...formData.step5
  });

  const requiredFields = [
    'lastName', 'firstName', 'addressType', 'address1', 'zip',
    'city', 'state', 'county', 'country', 'email', 'phoneType', 'phoneNumber'
  ];

  useEffect(() => {
    const allFilled = requiredFields.every((key) => fields[key]?.trim() !== '');
    setStepValid(allFilled);
    updateFormData('step5', fields);
  }, [fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields({ ...fields, [name]: value });
  };

  const Row = ({ label, name, type = 'text', optional }) => (
    <div className="form-row">
      <label>
        {label} {!optional && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input type={type} name={name} value={fields[name]} onChange={handleChange} />
    </div>
  );

  return (
    <div className="step-body">
      <div className="step-header">🧍 Tell us about you <span style={{ color: 'red' }}>*</span></div>
      <div className="certification-fields">
        <Row label="If you are a company, what is the name of your company?" name="companyName" optional />
        <Row label="If you are not a company, what is your last name?" name="lastName" />
        <Row label="What is your first name?" name="firstName" />
        <Row label="What is your middle name?" name="middleName" optional />
        <Row label="Name Suffix" name="nameSuffix" optional />

        <div className="form-row">
          <label>Do you need an interpreter?</label>
          <select name="interpreter" value={fields.interpreter} onChange={handleChange}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <Row label="Select Language if Needed" name="language" optional />

        <hr />
        <div className="form-subsection">📫 Mailing Address</div>
        <Row label="Address Type" name="addressType" />
        <Row label="Address 1" name="address1" />
        <Row label="Address 2" name="address2" optional />
        <Row label="Zip" name="zip" />
        <Row label="City" name="city" />
        <Row label="State" name="state" />
        <Row label="County" name="county" />
        <Row label="Country" name="country" />

        <hr />
        <div className="form-subsection">📞 Email and Phone</div>
        <Row label="Email" name="email" type="email" />
        <Row label="Telephone Type" name="phoneType" />
        <Row label="Telephone Number" name="phoneNumber" />
        <Row label="Extension" name="extension" optional />
      </div>
    </div>
  );
};

export default Step5;
