const FeedControlBar = ({ filter, sort, onFilterChange, onSortChange }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray rounded-lg mb-6 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {['All', 'My-topics', 'Following'].map((option) => (
          <button
            key={option}
            onClick={() => onFilterChange(option)}
            className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${
              filter === option 
                ? 'bg-stellar-blue border-stellar-blue text-white shadow-stellar-blue-glow'
                : 'border-eclipse-border dark:border-space-gray bg-eclipse-border/30 dark:bg-space-darker text-eclipse-text-light dark:text-space-text hover:bg-stellar-blue/10 hover:text-stellar-blue hover:border-stellar-blue/50'
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
          className="pl-4 pr-8 py-2 rounded-lg border border-eclipse-border dark:border-space-gray bg-eclipse-border/30 dark:bg-space-darker text-eclipse-text-light dark:text-space-text appearance-none focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-colors hover:bg-stellar-blue/10 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="trending">Trending</option>
          <option value="most-discussed">Most Discussed</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-eclipse-muted-light dark:text-space-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FeedControlBar;
