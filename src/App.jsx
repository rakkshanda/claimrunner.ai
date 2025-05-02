// src/App.jsx
import React, { useState } from 'react';
import Step1 from './components/step1';
import Step2 from './components/step2';
import Step3 from './components/step3';
import Step4 from './components/step4';
import Step5 from './components/step5';
import Step6 from './components/step6';
import Step7 from './components/step7';
import Step8 from './components/step8';
import './App.scss';

const App = () => {
  const [step, setStep] = useState(1);
  const [stepValid, setStepValid] = useState(true);

  const [formData, setFormData] = useState({
    step2: [],
    step3: '',
    step4: {},
    step5: '',
    step6: '',
    step7: '',
    step8: {},
  });

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
  };

  const steps = [
    'Hello!',
    'Acknowledgments',
    'What will happen after I file the case?',
    'Let’s begin with some basic case information *',
    'Tell us about you *',
    'Who are you suing? *',
    'Why are you suing this company or person? What happened? *',
    'Certification',
  ];

  const renderStep = () => {
    const stepProps = { formData, updateFormData, setStepValid };
    switch (step) {
      case 1: return <Step1 {...stepProps} />;
      case 2: return <Step2 {...stepProps} />;
      case 3: return <Step3 {...stepProps} />;
      case 4: return <Step4 {...stepProps} />;
      case 5: return <Step5 {...stepProps} />;
      case 6: return <Step6 {...stepProps} />;
      case 7: return <Step7 {...stepProps} />;
      case 8: return <Step8 {...stepProps} />;
      default: return <Step1 {...stepProps} />;
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setStepValid(true);
    }
  };

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
      setStepValid(true);
    }
  };

  return (
    <div className="app-wrapper">
      <h2 className="portal-title">Guided Small Claims Case Initiation-Portal</h2>

      <div className="step-box">
      <div className="nav-buttons">
          {step > 1 && (
            <button onClick={handlePrev}>&#11013; Previous Step</button>
          )}
          <button onClick={handleNext} disabled={!stepValid}>Next Step &#11157;  </button>
        </div>

        <div className="step-container">
          <div className="step-sidebar">
            {steps.map((label, index) => {
              const isCompleted = index + 1 < step;
              const isCurrent = index + 1 === step;
              const icon = isCompleted ? '✓' : isCurrent ? '📝' : '';
              return (
                <button
                  key={index}
                  className={`step-button ${isCurrent ? 'active' : ''}`}
                  disabled
                >
                  {icon && <span style={{ marginRight: '8px', color: 'white' }}>{icon}</span>}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="step-content">
            {renderStep()}
          </div>
        </div>

        <div className="nav-buttons">
          {step > 1 && (
            <button onClick={handlePrev}>&#11013; Previous Step</button>
          )}
          <button onClick={handleNext} disabled={!stepValid}>Next Step &#11157;  </button>
        </div>
      </div>
    </div>
  );
};

export default App;
