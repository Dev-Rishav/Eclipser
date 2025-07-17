const FeedControlBar = ({ filter, sort, onFilterChange, onSortChange }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {['All', 'My-topics', 'Following'].map((option) => (
          <button
            key={option}
            onClick={() => onFilterChange(option)}
            className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${
              filter === option 
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
          className="pl-4 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:bg-gray-100 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="trending">Trending</option>
          <option value="most-discussed">Most Discussed</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FeedControlBar;
