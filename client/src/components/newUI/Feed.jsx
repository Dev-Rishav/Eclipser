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
import { createPost } from '../../utility/createPost';
import socket from '../../config/socket';
import axiosInstance from '../../config/axiosConfig';
import { API_ENDPOINTS, apiLog, apiError } from '../../config/api';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [postType, setPostType] = useState('query'); // Track which type of post to create
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
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
    try {
      const createdPost = await createPost(postData);
      return createdPost;
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


  //! Filter posts by type implementation
  const onFilter = async(filterBy) => {
    try {
      setIsFilterLoading(true);
      
      // Update the local state immediately for UI responsiveness
      setFilterBy(filterBy);
      setSelectedFilter(filterBy);
      
      // If filtering by 'all', no need to make API call as PostCards will handle it
      if (filterBy === 'all') {
        apiLog('Showing all posts');
        return;
      }
      
      // Make API call for specific post types
      apiLog(`🔍 Filtering posts by type: ${filterBy}`);
      apiLog(`📡 API Endpoint: ${API_ENDPOINTS.POSTS.By_TYPE(filterBy)}`);
      
      const response = await axiosInstance.get(API_ENDPOINTS.POSTS.By_TYPE(filterBy));
      const data = response.data;
      
      // The filtered data will be handled by PostCards component
      // which listens to the filterBy prop changes
      apiLog(`✅ Found ${data?.posts?.length || data?.length || 0} posts of type ${filterBy}`);
      
    } catch(error) {
      apiError('Error fetching filter options:', error);
      toast.error(`Failed to filter posts by ${filterBy}`);
    } finally {
      setIsFilterLoading(false);
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: '📑' },
    { value: 'query', label: 'Questions', icon: '❓' },
    { value: 'discussion', label: 'Discussions', icon: '💬' },
    { value: 'achievement', label: 'Achievements', icon: '🏆' },
  ];

  // Animated background elements
  const floatingStars = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-stellar-blue rounded-full z-0"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        opacity: [0.4, 1, 0.4],
        scale: [1, 2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  ));

  const planets = [
    { size: 'w-20 h-20', color: 'bg-gradient-to-br from-stellar-purple/50 to-stellar-blue/50', position: 'top-20 left-20', delay: 0 },
    { size: 'w-16 h-16', color: 'bg-gradient-to-br from-stellar-orange/40 to-stellar-green/40', position: 'top-40 right-32', delay: 1 },
    { size: 'w-12 h-12', color: 'bg-gradient-to-br from-stellar-green/50 to-stellar-blue/50', position: 'bottom-32 left-40', delay: 2 },
    { size: 'w-14 h-14', color: 'bg-gradient-to-br from-stellar-orange/40 to-stellar-purple/40', position: 'bottom-20 right-20', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text relative overflow-hidden">
      {/* Animated Background Stars - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingStars}
        
        {/* Add some shooting stars for visibility test */}
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-1 h-8 bg-gradient-to-t from-stellar-blue to-transparent rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 200],
              y: [0, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating Planets - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {planets.map((planet, index) => (
          <motion.div
            key={index}
            className={`absolute ${planet.size} ${planet.color} rounded-full ${planet.position}`}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              delay: planet.delay,
            }}
          />
        ))}
      </div>

      {/* Animated Particles - Fixed Z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-stellar-blue rounded-full shadow-lg shadow-stellar-blue/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -120],
              opacity: [0, 0.8, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Add some larger glowing orbs for visibility */}
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-3 h-3 bg-stellar-purple rounded-full shadow-lg shadow-stellar-purple/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Ambient cosmic glow - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-stellar-blue/30 rounded-full blur-3xl"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.3, 1],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stellar-purple/30 rounded-full blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            x: [20, -20, 20],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 2,
          }}
        />
        
        {/* Additional smaller glows */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-stellar-orange/25 rounded-full blur-2xl"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.4, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: 4,
          }}
        />
      </div>
      
      {/* Industry-Standard 3-Column Layout */}
      <div className="relative z-20 min-h-screen">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-stellar-blue/10 via-transparent to-stellar-purple/10 pointer-events-none z-10" />
        
        {/* Main container with proper spacing for navbar - Full width utilization */}
        <div className=" min-h-screen">
          <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
            {/* Full-width responsive grid with better proportions */}
            <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
              
              {/* Left Sidebar - Better proportions */}
              <aside className="hidden lg:block lg:col-span-2 xl:col-span-3 2xl:col-span-2">
                <div className="sticky top-20 space-y-6 py-2 lg:py-4">
                  <Sidebar />
                </div>
              </aside>

              {/* Main Feed Column - Maximum utilization of space */}
              <main className="col-span-full lg:col-span-6 xl:col-span-6 2xl:col-span-8 space-y-6 py-2 lg:py-4">
                {/* Sorting and Filtering Controls */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray p-4">
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
                      <div className="relative">
                        <select
                          value={selectedFilter}
                          onChange={(e) => {
                            const newFilter = e.target.value;
                            onFilter(newFilter);
                          }}
                          disabled={isFilterLoading}
                          className="bg-eclipse-border/30 dark:bg-space-darker border border-eclipse-border/50 dark:border-space-gray/50 rounded-lg px-3 py-1 pr-8 text-sm text-eclipse-text-light dark:text-space-text focus:ring-2 focus:ring-stellar-orange/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {filterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        {isFilterLoading && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-stellar-orange border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      {selectedFilter !== 'all' && (
                        <span className="px-2 py-1 text-xs bg-stellar-orange/20 text-stellar-orange rounded-full border border-stellar-orange/30 font-medium">
                          Active: {filterOptions.find(f => f.value === selectedFilter)?.label}
                        </span>
                      )}
                    </div>
                    </div>
                  </div>
                </motion.div>

                {/* Post Creation Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray p-4 shadow-space-card">
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
                        <span className="text-lg">💬</span>
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


                {/* Posts Section */}
                <PostCards 
                  sortBy={sortBy} 
                  filterBy={filterBy}
                  user={user}
                />
              </main>

              {/* Right Sidebar - Balanced width */}
              <aside className="hidden lg:block lg:col-span-2 xl:col-span-3 2xl:col-span-2">
                <div className="sticky top-20 space-y-6 py-2 lg:py-4">
                  <RightSidebar />
                  
                  {/* Chat Preview Integration */}
                  {chats.length > 0 && (
                    <div className="bg-eclipse-surface dark:bg-space-dark rounded-lg border border-eclipse-border dark:border-space-gray">
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
              </aside>

            </div>
          </div>
        </div>
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