// src/components/step6.jsx
import React, { useEffect, useState } from 'react';

const Step6 = ({ formData, updateFormData, setStepValid }) => {
  const [fields, setFields] = useState({
    companyName: '',
    lastName: '',
    firstName: '',
    middleName: '',
    nameSuffix: '',
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
    ...formData.step6,
  });

  // ✅ Only the following fields are required
  const requiredFields = [
    'lastName', 'firstName', 'addressType', 'address1',
    'zip', 'city', 'state', 'county', 'country'
  ];

  useEffect(() => {
    const allValid = requiredFields.every((key) => fields[key]?.trim() !== '');
    setStepValid(allValid);
    updateFormData('step6', fields);
  }, [fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields({ ...fields, [name]: value });
  };

  return (
    <div className="step-body">
      <div className="step-header">👤 Who are you suing? <span style={{ color: 'red' }}>*</span></div>

      <div className="certification-fields">
        <div className="form-row">
          <label>Is it a company? If so, what is the name of the Company?</label>
          <input type="text" name="companyName" value={fields.companyName} onChange={handleChange} />
        </div>

        <p style={{ fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
          <strong>If you are suing a company</strong>, you may need to know the Registered Agent information and confirm they are doing business in WA to properly serve all the documents.
          You can find the Registered Agent by searching the business name on the Secretary of State’s website:&nbsp;
          <a href="https://ccfs.sos.wa.gov/#/home" target="_blank" rel="noopener noreferrer">
            Washington Secretary of State – Corporations
          </a>.
        </p>

        <div className="form-row">
          <label>If it’s not a company, what is the person’s LAST name?<span style={{ color: 'red' }}>*</span></label>
          <input type="text" name="lastName" value={fields.lastName} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>What is their first name?<span style={{ color: 'red' }}>*</span></label>
          <input type="text" name="firstName" value={fields.firstName} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>What is their middle name?</label>
          <input type="text" name="middleName" value={fields.middleName} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Name Suffix</label>
          <input type="text" name="nameSuffix" value={fields.nameSuffix} onChange={handleChange} />
        </div>

        <hr />
        <div className="form-subsection">📍 What is their address?<span style={{ color: 'red' }}>*</span></div>

        {[
          { label: 'Address Type', name: 'addressType' },
          { label: 'Address 1', name: 'address1' },
          { label: 'Address 2', name: 'address2', optional: true },
          { label: 'Zip', name: 'zip' },
          { label: 'City', name: 'city' },
          { label: 'State', name: 'state' },
          { label: 'County', name: 'county' },
          { label: 'Country', name: 'country' }
        ].map(({ label, name, optional }) => (
          <div className="form-row" key={name}>
            <label>{label}{!optional && <span style={{ color: 'red' }}>*</span>}</label>
            <input type="text" name={name} value={fields[name]} onChange={handleChange} />
          </div>
        ))}

        <hr />
        <div className="form-subsection">📞 Do you have additional contact information for them?</div>

        <div className="form-row">
          <label>Email</label>
          <input type="email" name="email" value={fields.email} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Telephone Type</label>
          <input type="text" name="phoneType" value={fields.phoneType} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Telephone Number</label>
          <input type="text" name="phoneNumber" value={fields.phoneNumber} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Extension</label>
          <input type="text" name="extension" value={fields.extension} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default Step6;
