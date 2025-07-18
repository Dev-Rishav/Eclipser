import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { useState } from 'react';
import Sidebar from './Sidebar';
import PostCards from './PostCards';
import RightSidebar from './RightSidebar';
import PostCreationModal from '../PostCreationModal';
import { createPost } from '../../utility/createPost';
import { toast } from 'react-hot-toast';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [postType, setPostType] = useState('query'); // Track which type of post to create

  const handlePostCreated = async (postData) => {
    try {
      const newPost = await createPost(postData);
      toast.success('Post created successfully!');
      
      // Trigger a refresh of the PostCards component
      // This could be improved with better state management
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handlePostTypeClick = (type) => {
    setPostType(type);
    setShowCreatePost(true);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '🕒' },
    { value: 'oldest', label: 'Oldest First', icon: '⏰' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'trending', label: 'Trending', icon: '📈' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: '📑' },
    { value: 'questions', label: 'Questions', icon: '❓' },
    { value: 'solutions', label: 'Solutions', icon: '💡' },
    { value: 'snippets', label: 'Code Snippets', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">          <div className="lg:col-span-2">
            {/* Sorting and Filtering Controls */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray p-4"
            >
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-eclipse-text-light dark:text-space-text">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-eclipse-border/30 dark:bg-space-darker border border-eclipse-border/50 dark:border-space-gray/50 rounded-lg px-3 py-1 text-sm text-eclipse-text-light dark:text-space-text focus:ring-2 focus:ring-stellar-blue/50 outline-none"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-eclipse-text-light dark:text-space-text">Filter:</span>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="bg-eclipse-border/30 dark:bg-space-darker border border-eclipse-border/50 dark:border-space-gray/50 rounded-lg px-3 py-1 text-sm text-eclipse-text-light dark:text-space-text focus:ring-2 focus:ring-stellar-orange/50 outline-none"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-4"
            >
                {/* New Post Block */}
                <div className="bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray p-4 shadow-space-card mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border-2 border-stellar-blue/50 object-cover shadow-stellar-blue-glow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stellar-blue flex items-center justify-center shadow-stellar-blue-glow">
                        <span className="text-sm font-bold text-white">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 text-left px-4 py-3 bg-eclipse-border/30 dark:bg-space-darker rounded-full text-eclipse-muted-light dark:text-space-muted hover:bg-eclipse-border/50 dark:hover:bg-space-light/20 transition-colors border border-eclipse-border/50 dark:border-space-gray/50"
                    >
                      What&apos;s on your mind, {user?.username || 'Developer'}?
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePostTypeClick('query')}
                      className="flex items-center gap-2 px-4 py-2 bg-stellar-blue/10 hover:bg-stellar-blue/20 text-stellar-blue rounded-lg transition-colors border border-stellar-blue/30"
                    >
                      <span className="text-lg">❓</span>
                      <span className="text-sm font-medium">Ask Question</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePostTypeClick('discussion')}
                      className="flex items-center gap-2 px-4 py-2 bg-stellar-orange/10 hover:bg-stellar-orange/20 text-stellar-orange rounded-lg transition-colors border border-stellar-orange/30"
                    >
                      <span className="text-lg">�</span>
                      <span className="text-sm font-medium">Start Discussion</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePostTypeClick('achievement')}
                      className="flex items-center gap-2 px-4 py-2 bg-stellar-green/10 hover:bg-stellar-green/20 text-stellar-green rounded-lg transition-colors border border-stellar-green/30"
                    >
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium">Share Achievement</span>
                    </motion.button>
                  </div>
                </div>

                {/* Post Creation Modal */}
                <PostCreationModal
                  isOpen={showCreatePost}
                  onClose={() => setShowCreatePost(false)}
                  onPostCreated={handlePostCreated}
                  initialPostType={postType}
                />
              </motion.div>
              <PostCards sortBy={sortBy} filterBy={filterBy} />
            </div>
            <div className="lg:col-span-1">
              <RightSidebar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feed;