import React from 'react';
import './Loader.css';

const Loader = () => {
    console.log("inside loader-------------->");
    
  return (
    <section className="dots-container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      {/* <div className="dot"></div> */}
    </section>
  );
};

export default Loader;