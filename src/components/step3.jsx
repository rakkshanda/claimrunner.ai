import React from 'react';

const Step3 = () => {
  return (
    <div className="step-body">
      <div className="step-header">❓ What will happen after I file the case?</div>
      <div className="step-content">
        <p>
          Once you complete this interview and pay for the case, the Notice of Small Claims and case will be created
          with King County District Court.
        </p>
        <p>
          Upon acceptance of your filing, conformed copies of the Notice will be emailed to you, or will be made
          available for pickup at any KCDC Court Location.
        </p>
        <p>
          The clerk will set a Pretrial Conference Hearing and will prepare a packet with information for you and one
          packet for each party you are suing. These packets will be mailed to you at the address provided.{" "}
          <strong>Do not initiate service until you have received these packets.</strong> Information regarding service
          to the other party will be included in the packet.
        </p>
      </div>
    </div>
  );
};

export default Step3;
