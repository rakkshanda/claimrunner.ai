// src/components/step2.jsx
import React, { useEffect } from 'react';

const checklistItems = [
  "I understand that the filing fee is $50.00 and will be required at the end of this interview to initiate the case with the court.",
  "I understand the dollar amount I'm trying to recoup cannot exceed $10,000 in cases brought by a person. The limit for all other cases brought by a business, corporation, or other business entity, cannot exceed $5,000.",
  "I understand that my claim needs to be proper or the case might be dismissed with no refund. To read more about proper claims please review the information on our website: Small Claims.",
  "I am at least 18 years of age or older.",
  "The clerk of the court may assist you with forms and general information about the process but is not allowed to give legal advice.",
  "Washington State has open courts. That means that in almost all case types, a document filed in a court case is a public record. Small claims documents are public records.",
  "Exhibits, attachments, or other evidence may not be filed prior to trial."
];

const Step2 = ({ formData, updateFormData, setStepValid }) => {
  const currentSelections = Array.isArray(formData.step2?.acknowledgments) ? formData.step2.acknowledgments : [];

  useEffect(() => {
    const isComplete = checklistItems.every(item => currentSelections.includes(item));
    setStepValid(isComplete);
  }, [currentSelections, setStepValid]);

  const handleCheckboxChange = (item) => {
    let updatedSelections = [];

    if (currentSelections.includes(item)) {
      updatedSelections = currentSelections.filter(i => i !== item);
    } else {
      updatedSelections = [...currentSelections, item];
    }

    updateFormData('step2', { acknowledgments: updatedSelections });
  };

  return (
    <div className="step-body">
      <div className="step-header">📋 Acknowledgments</div>
      <div className="acknowledgments-form">
        {checklistItems.map((item, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={currentSelections.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />{" "}
              {item.includes("Small Claims") ? (
                <>
                  {item.split(":")[0]}: <a href="#">Small Claims</a>.
                </>
              ) : (
                item
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step2;
