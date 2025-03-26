// HomePage.jsx
import React, { useState } from 'react';
import '../styles/Home.css';
import { SubscribedTopicsList } from '../components/SubscribedTopicsList';
import { QuickAccess } from '../components/QuickAccess';
import { LiveActivity } from '../components/LiveActivity';
import { ChatPreview } from '../components/ChatPreview';
import { PostCard } from '../components/PostCard';

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Sample data
  const posts = [
    { id: 1, topic: 'WebDev', content: 'How to optimize React rendering?', author: 'JohnDoe', votes: 45, answers: 12, time: '2h' },
    // ... more posts
  ];

  return (
    <div className="home-container cosmic-bg">
      {/* <div className="eclipse-header">
        <div className="corona-effect"></div>
      </div> */} 
      {/* not working */}

      <div className="main-grid">
        {/* Left Sidebar */}
        <div className="sidebar-left starmap-bg">
          <SubscribedTopicsList />
          <QuickAccess />
        </div>

        {/* Main Feed */}
        <div className="main-feed cosmic-feed">
          <FeedControlBar 
            filter={selectedFilter}
            sort={selectedSort}
            onFilterChange={setSelectedFilter}
            onSortChange={setSelectedSort}
          />
          <div className="feed-content">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right nebula-bg">
          <LiveActivity />
          <ChatPreview />
        </div>
      </div>
    </div>
  );
};

// Sub-components
const FeedControlBar = ({ filter, sort, onFilterChange, onSortChange }) => (
  <div className="feed-control-bar">
    <div className="filter-options">
      {['all', 'my-topics', 'following'].map(option => (
        <button 
          key={option}
          className={`filter-btn ${filter === option ? 'active' : ''}`}
          onClick={() => onFilterChange(option)}
        >
          {option.replace('-', ' ')}
        </button>
      ))}
    </div>
    <div className="sort-options">
      <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="newest">Newest First</option>
        <option value="trending">Trending</option>
        <option value="most-discussed">Most Discussed</option>
      </select>
    </div>
  </div>
);


export default HomePage;