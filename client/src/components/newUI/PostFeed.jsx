import { useState } from 'react';
import FeedControlBar from '../FeedControlBar';
import { PostCard } from '../PostCard';

export const PostFeed = ({ posts }) => {
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("All");
  

  const displayedPosts = posts; 

  return (
    <div className="space-y-6">
      <FeedControlBar 
        filter={filter} 
        sort={sort} 
        onFilterChange={setFilter} 
        onSortChange={setSort} 
      />
      {displayedPosts?.length > 0 ? (
        displayedPosts.map((post) => <PostCard key={post._id} post={post} />)
      ) : (
        <div className="text-center py-12 text-space-muted font-mono">
          No mission reports filed.
        </div>
      )}
    </div>
  );
};