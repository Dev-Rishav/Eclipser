import React from 'react';
import '../styles/SidebarComponents.css';



export const SubscribedTopicsList = () => (
  <div className="topics-list">
    <h3>Your Topics</h3>
    <ul>
      <li className="topic-item">
        <span>#WebDev</span>
        <span className="notification-badge">3</span>
      </li>
      {/* More topics */}
    </ul>
    <button className="join-topic-btn">
      + Join New Topic
    </button>
  </div>
);