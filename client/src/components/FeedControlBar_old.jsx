// FeedControlBar.jsx
import React from 'react';

const FeedControlBar = ({ filter, sort, onFilterChange, onSortChange }) => {
  // console.log("FeedControlBar Rendered");
  
  return (
    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-stellar/90 to-cosmic/90 border border-nebula/30 rounded-xl mb-6 backdrop-blur-lg">
      <div className="flex flex-wrap gap-2">
        {['All', 'My-topics', 'Following'].map((option) => (
          <button
            key={option}
            onClick={() => onFilterChange(option)}
            className={`px-4 py-2 rounded-full border transition-all ${
              filter === option 
                ? 'bg-gradient-to-br from-nebula to-supernova border-transparent text-cosmic font-semibold'
                : 'border-nebula/30 bg-nebula/10 text-stardust/80 hover:bg-nebula/20 hover:text-stardust'
            }`}
          >
            {option.replace('-', ' ')}
          </button>
        ))}
      </div>
      
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="pl-4 pr-8 py-2 rounded-full border border-nebula/30 bg-nebula/10 text-stardust/80 appearance-none focus:outline-none focus:ring-2 focus:ring-nebula/50 transition-all hover:text-stardust"
        >
          <option value="newest">Newest First</option>
          <option value="trending">Trending</option>
          <option value="most-discussed">Most Discussed</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-stardust/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FeedControlBar;