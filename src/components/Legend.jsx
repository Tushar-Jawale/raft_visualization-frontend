import React from 'react';
import './Legend.css';

const Legend = () => {
  return (
    <div className="legend-container">
      <div className="legend-item">
        <div className="legend-circle legend-leader" />
        <span>Leader</span>
      </div>
      <div className="legend-item">
        <div className="legend-circle legend-candidate" />
        <span>Candidate</span>
      </div>
      <div className="legend-item">
        <div className="legend-circle legend-follower" />
        <span>Follower</span>
      </div>
      <div className="legend-item">
        <div className="legend-circle legend-offline" />
        <span>Offline</span>
      </div>
    </div>
  );
};

export default Legend;
