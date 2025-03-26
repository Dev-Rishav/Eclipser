import React from 'react';
import '../styles/SpaceComponents.css';

export const LiveActivity = () => (
  <div className="live-activity cosmic-panel">
    <h3 className="stellar-subheader">Celestial Pulse</h3>
    
    <div className="cosmic-event">
      <div className="event-tag contest-tag">Contest</div>
      <h4>Galactic UI Challenge</h4>
      <div className="countdown-timer">
        <span className="cosmic-time">48:35:12</span>
        <progress className="orbit-progress" value="65" max="100"></progress>
      </div>
    </div>

    <div className="cosmic-event">
      <div className="event-tag achievement-tag">Achievement</div>
      <h4>NeptuneTeam solved Dark Matter Dilemma</h4>
      <div className="stellar-badge">★ Quantum Solver</div>
    </div>

    <div className="cosmic-event">
      <div className="event-tag update-tag">Network</div>
      <h4>100+ pilots joined #AstroPhysics</h4>
      <div className="gravitational-wave"></div>
    </div>
  </div>
);