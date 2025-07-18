import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from "react-redux";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import PostCards from './PostCards';
import RightSidebar from './RightSidebar';
import PostCreationModal from '../PostCreationModal';
import { toast } from 'react-hot-toast';
import { fetchRecentChats } from '../../utility/chatUtils';
import { ChatModal } from '../ChatModal';
import { AnimatedModal } from '../AnimateModal';
import { ChatPreview } from '../ChatPreview';
import { clearPostCache } from '../../utility/storageCleaner';
import socket from '../../config/socket';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [postType, setPostType] = useState('query'); // Track which type of post to create
  
  // Legacy Home.jsx state management
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  // const [isCreatingPost, setIsCreatingPost] = useState(false);
  
    // Post loader hook from legacy - REMOVED, now handled by PostCards
  // const {
  //   posts,
  //   setPosts,
  //   isLoading,
  //   lastPostRef,
  //   allPostsExhausted,
  //   livePosts,
  //   setLivePosts, // Used internally by socket integration in usePostLoader
  // } = usePostLoader(user);
  
  // Chat management from legacy
  const [chats, setChats] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  // Legacy useEffects for cleanup and initialization
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearPostCache();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Loading simulation from legacy - REMOVED to prevent interference
  // useEffect(() => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1500);
  // }, [setIsLoading]);

  // Chat loading from legacy
  useEffect(() => {
    const loadChats = async () => {
      try {
        const recentChats = await fetchRecentChats();
        setChats(recentChats.chats || []);
      } catch (error) {
        console.error('Error loading chats:', error);
        setChats([]);
      }
    };
    loadChats();
  }, []);

  // Socket connection from legacy
  useEffect(() => {
    if (!user?._id) return;
    
    socket.connect();
    console.log("Socket connected");
    socket.emit("register", user._id);

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Load more chats functionality from legacy
  const loadMoreChats = async () => {
    if (!hasMoreChats) return;

    try {
      const response = await fetchRecentChats(page + 1);
      setChats((prev) => [...prev, ...response.chats]);
      setPage((prev) => prev + 1);
      setHasMoreChats(response.chats.length > 0);
    } catch (error) {
      console.error('Error loading more chats:', error);
    }
  };

  const handlePostCreated = async (postData) => {
    // This will be handled by the PostCards component itself
    try {
      toast.success('Post created successfully!');
      return postData;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handlePostTypeClick = (type) => {
    setPostType(type);
    setShowCreatePost(true);
    // setIsCreatingPost(true); // Legacy state
  };

  const handleCloseModal = () => {
    setShowCreatePost(false);
    // setIsCreatingPost(false); // Legacy state
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '🕒' },
    { value: 'oldest', label: 'Oldest First', icon: '⏰' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'trending', label: 'Trending', icon: '📈' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: '📑' },
    { value: 'query', label: 'Questions', icon: '❓' },
    { value: 'discussion', label: 'Discussions', icon: '�' },
    { value: 'achievement', label: 'Achievements', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
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
                    value={selectedSort}
                    onChange={(e) => {
                      setSelectedSort(e.target.value);
                      setSortBy(e.target.value);
                    }}
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
                    value={selectedFilter}
                    onChange={(e) => {
                      setSelectedFilter(e.target.value);
                      setFilterBy(e.target.value);
                    }}
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
                <AnimatePresence>
                  {showCreatePost && (
                    <PostCreationModal
                      isOpen={showCreatePost}
                      onClose={handleCloseModal}
                      onPostCreated={handlePostCreated}
                      initialPostType={postType}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              {/* Posts Section - Now using industry-standard infinite scroll */}
              <PostCards 
                sortBy={sortBy} 
                filterBy={filterBy}
                user={user}
              />
            </div>
            <div className="lg:col-span-1">
              <RightSidebar />
              
              {/* Chat Preview Integration */}
              {chats.length > 0 && (
                <div className="mt-4 bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray">
                  <ChatPreview
                    chats={chats}
                    title="Recent Chats"
                    onStartNewChat={() => {
                      setIsChatOpen(true);
                      setSelectedChat(null);
                    }}
                    onLoadMore={loadMoreChats}
                    hasMore={hasMoreChats}
                    onSelectChat={(chat) => {
                      setSelectedChat(chat);
                      setIsChatOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Chat Modal with AnimatedModal wrapper */}
      <AnimatedModal
        isOpen={isChatOpen}
        onClose={() => {}}
      >
        <ChatModal
          chat={selectedChat}
          onClose={() => {
            setIsChatOpen(false);
            console.log("Chat closed");
            setSelectedChat(null);
          }}
        />
      </AnimatedModal>
    </div>
  );
};

export default Feed;