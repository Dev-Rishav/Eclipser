import React from 'react';
import '../styles/SpaceComponents.css';

export const ChatPreview = () => (
  <div className="chat-preview cosmic-panel">
    <h3 className="stellar-subheader">Quantum Comm</h3>
    
    <div className="active-chats">
      <div className="cosmic-chat">
        <div className="chat-avatar online">
          <div className="cosmic-avatar">SP</div>
          <div className="quantum-dot"></div>
        </div>
        <div className="chat-details">
          <h4>SpaceProbe</h4>
          <p className="message-preview">What about the orbital calculation...</p>
          <span className="cosmic-time">2.4 ly ago</span>
        </div>
      </div>
    </div>

    <button className="supernova-btn warp-button">
      Initiate Wormhole Chat
    </button>
  </div>
);