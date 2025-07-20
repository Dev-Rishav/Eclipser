import { useEffect, useState } from "react";
import useUpdateTags from "../../hooks/useUpdateTags";
import { useSelector } from "react-redux";
import { fetchTagsList } from "../../utility/fetchTagsList";
import { motion } from 'framer-motion';
import { FaTag, FaTags, FaPlus, FaMinus, FaExpand, FaCompress } from 'react-icons/fa';

const AccentThree = () => {
  const {user} = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const updateTags = useUpdateTags();

  const handleJoinTopic = (topic) => {
    updateTags([topic], false);
  };

  const handleRemoveTopic = (topic) => {
    updateTags([topic], true);
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await fetchTagsList();
        const tagsArray = Object.keys(response);
        setAllTags(tagsArray);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setAllTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const availableTags = allTags?.filter(
    (tag) => !user?.subscribedTopics?.includes(tag)
  );

  const hasSubscribedTopics = user?.subscribedTopics && user.subscribedTopics.length > 0;

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-eclipse-surface dark:bg-space-darker rounded-xl p-4 border border-stellar-orange/30 shadow-stellar-orange-glow w-full animate-edge-glow"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-stellar-orange to-stellar-blue rounded-full flex items-center justify-center">
            <FaTags className="text-white text-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-eclipse-text-light dark:text-space-text">Topics</h2>
            <div className="text-xs text-stellar-orange font-mono">#Control</div>
          </div>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin w-5 h-5 border-2 border-stellar-orange border-t-transparent rounded-full"></div>
          <p className="text-eclipse-muted-light dark:text-space-muted text-sm ml-3">Loading...</p>
        </div>
      </motion.div>
    );
  }

  // Compact view - shows subscribed topics only
  if (!isExpanded) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="topics-section bg-eclipse-surface dark:bg-space-darker rounded-xl border border-stellar-orange/30 shadow-stellar-orange-glow w-full animate-edge-glow"
      >
        {/* Header with expand button */}
        <div className="p-4 border-b border-stellar-orange/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-stellar-orange to-stellar-blue rounded-full flex items-center justify-center shadow-stellar-orange-glow">
                <FaTags className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-eclipse-text-light dark:text-space-text">Topics</h2>
                <div className="text-xs text-stellar-orange font-mono">#{hasSubscribedTopics ? user.subscribedTopics.length : 0} Active</div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 bg-stellar-blue/10 hover:bg-stellar-blue/20 rounded-lg transition-colors border border-stellar-blue/20 hover:border-stellar-blue/40"
              title="Expand to see all topics"
            >
              <FaExpand className="text-stellar-blue text-sm" />
            </button>
          </div>
        </div>

        {/* Subscribed Topics Content */}
        <div className="p-4 space-y-3">
          {hasSubscribedTopics ? (
            <>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                {user.subscribedTopics.slice(0, 4).map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-2 bg-stellar-green/10 rounded-lg hover:bg-stellar-green/20 transition-all group border border-stellar-green/20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-stellar-green rounded-full animate-pulse"></div>
                      <span className="text-eclipse-text-light dark:text-space-text text-sm font-medium">#{topic}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveTopic(topic)}
                      className="bg-stellar-orange hover:bg-stellar-orange/80 text-white text-xs px-2 py-1 rounded-full shadow-stellar-orange-glow transition-all hover:scale-105 flex items-center gap-1 opacity-0 group-hover:opacity-100"
                    >
                      <FaMinus size={8} />
                    </button>
                  </motion.div>
                ))}
                {user.subscribedTopics.length > 4 && (
                  <div className="text-center py-2">
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-stellar-blue text-xs hover:text-stellar-blue/80 transition-colors"
                    >
                      +{user.subscribedTopics.length - 4} more topics
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-eclipse-muted-light dark:text-space-muted text-sm mb-2">
                No subscribed topics
              </p>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-stellar-blue text-xs hover:text-stellar-blue/80 transition-colors bg-stellar-blue/10 px-3 py-1 rounded-full"
              >
                Browse Topics
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Expanded view - shows all topics with subscription management
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="topics-section bg-eclipse-surface dark:bg-space-darker rounded-xl border border-stellar-orange/30 shadow-stellar-orange-glow w-full animate-edge-glow overflow-hidden"
    >
      {/* Header with compress button */}
      <div className="p-4 border-b border-stellar-orange/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-stellar-orange to-stellar-blue rounded-full flex items-center justify-center shadow-stellar-orange-glow">
              <FaTags className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-eclipse-text-light dark:text-space-text">Topic Control</h2>
              <div className="text-xs text-stellar-orange font-mono">#Mission-Control</div>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 bg-stellar-purple/10 hover:bg-stellar-purple/20 rounded-lg transition-colors border border-stellar-purple/20 hover:border-stellar-purple/40"
            title="Collapse view"
          >
            <FaCompress className="text-stellar-purple text-sm" />
          </button>
        </div>
        
        {!hasSubscribedTopics && (
          <div className="mt-3 p-3 bg-stellar-blue/10 border border-stellar-blue/30 rounded-lg">
            <p className="text-stellar-blue text-sm font-medium">
              🚀 Subscribe to topics for personalized feed
            </p>
            <p className="text-eclipse-muted-light dark:text-space-muted text-xs mt-1">
              Currently showing all posts sorted by time
            </p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {/* Subscribed Topics Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-eclipse-text-light dark:text-space-text flex items-center gap-2">
              <FaTag className="text-stellar-green" />
              Active Topics
            </h3>
            <span className="text-xs text-stellar-green font-mono bg-stellar-green/10 px-2 py-1 rounded">
              {hasSubscribedTopics ? user.subscribedTopics.length : 0}
            </span>
          </div>
          
          {hasSubscribedTopics ? (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {user.subscribedTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 bg-stellar-green/10 rounded-lg hover:bg-stellar-green/20 transition-all group border border-stellar-green/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-stellar-green rounded-full animate-pulse"></div>
                    <span className="text-eclipse-text-light dark:text-space-text text-sm font-medium">#{topic}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="bg-stellar-orange hover:bg-stellar-orange/80 text-white text-xs px-2 py-1 rounded-full shadow-stellar-orange-glow transition-all hover:scale-105 flex items-center gap-1 opacity-0 group-hover:opacity-100"
                  >
                    <FaMinus size={8} />
                    Remove
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-eclipse-border/10 dark:bg-space-light/10 rounded-lg text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-eclipse-muted-light dark:text-space-muted text-sm">
                No active topics yet
              </p>
              <p className="text-eclipse-muted-light dark:text-space-muted text-xs mt-1">
                Subscribe to topics below for personalized content
              </p>
            </div>
          )}
        </div>

        {/* Available Topics Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-eclipse-text-light dark:text-space-text flex items-center gap-2">
              <FaPlus className="text-stellar-blue" />
              Discover Topics
            </h3>
            <span className="text-xs text-stellar-blue font-mono bg-stellar-blue/10 px-2 py-1 rounded">
              {availableTags ? availableTags.length : 0}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {availableTags && availableTags.length > 0 ? (
              availableTags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-2 bg-eclipse-border/10 dark:bg-space-light/10 rounded-lg hover:bg-stellar-blue/10 transition-all group border border-transparent hover:border-stellar-blue/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-eclipse-muted-light dark:bg-space-muted rounded-full"></div>
                    <span className="text-eclipse-text-light dark:text-space-text text-sm">#{tag}</span>
                  </div>
                  <button
                    onClick={() => handleJoinTopic(tag)}
                    className="bg-stellar-blue hover:bg-stellar-blue/80 text-white text-xs px-2 py-1 rounded-full shadow-stellar-blue-glow transition-all hover:scale-105 flex items-center gap-1 opacity-0 group-hover:opacity-100"
                  >
                    <FaPlus size={8} />
                    Join
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="p-3 text-center">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-eclipse-muted-light dark:text-space-muted text-sm">
                  All topics subscribed!
                </p>
                <p className="text-eclipse-muted-light dark:text-space-muted text-xs mt-1">
                  You&apos;re following every available topic
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccentThree;