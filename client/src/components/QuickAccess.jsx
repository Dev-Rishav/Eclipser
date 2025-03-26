import React from 'react';
import '../styles/SpaceComponents.css';

export const QuickAccess = () => (
  <div className="quick-access cosmic-panel">
    <h3 className="stellar-subheader">Orbital Shortcuts</h3>
    <div className="pinned-items">
      <div className="pinned-contact">
        <div className="cosmic-avatar">JS</div>
        <span>JohnStella</span>
      </div>
      <div className="pinned-contact">
        <div className="cosmic-avatar">MQ</div>
        <span>MarsQuest</span>
      </div>
    </div>
    <div className="stellar-divider"></div>
    <div className="space-bookmarks">
      <button className="bookmark-btn">
        <span className="constellation-icon">✦</span>
        Saved Solutions
      </button>
      <button className="bookmark-btn">
        <span className="constellation-icon">✦</span>
        Mission Drafts
      </button>
    </div>
  </div>
);