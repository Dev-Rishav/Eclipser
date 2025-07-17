import { useEffect, useState } from "react";
import useUpdateTags from "../../hooks/useUpdateTags";
import { useSelector } from "react-redux";
import { fetchTagsList } from "../../utility/fetchTagsList";
import { motion } from 'framer-motion';

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
        const tagsArray=Object.keys(response);
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
    (tag) => !user.subscribedTopics.includes(tag)
  );

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-eclipse-surface dark:bg-space-darker rounded-lg p-5 border border-stellar-orange/50 shadow-stellar-orange-glow w-full max-w-xs animate-edge-glow"
      >
        <h2 className="text-xl font-semibold text-eclipse-text-light dark:text-space-text mb-4">Your Topics</h2>
        <p className="text-eclipse-muted-light dark:text-space-muted text-sm italic">Loading topics...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-eclipse-surface dark:bg-space-darker rounded-lg p-5 border border-stellar-orange/50 shadow-stellar-orange-glow w-full max-w-xs animate-edge-glow"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-eclipse-text-light dark:text-space-text">Your Topics</h2>
        <div className="text-xs text-stellar-orange font-mono mt-1">#FF4500</div>
      </div>
      
      <ul className="space-y-2 mb-4">
        {user.subscribedTopics && user.subscribedTopics.length > 0 ? (
          user.subscribedTopics.map((topic, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-eclipse-border/30 dark:hover:bg-space-light/30 transition-all cursor-pointer group"
            >
              <span className="text-eclipse-text-light dark:text-space-text text-sm">#{topic}</span>
              <button
                onClick={() => handleRemoveTopic(topic)}
                className="bg-stellar-orange hover:bg-stellar-orange/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-stellar-orange-glow transition-colors"
              >
                Remove
              </button>
            </li>
          ))
        ) : (
          <li className="text-eclipse-muted-light dark:text-space-muted text-sm italic">
            No subscribed topics yet.
          </li>
        )}
      </ul>

      {isExpanded && (
        <div className="mt-4 border-t border-stellar-orange/30 pt-4">
          <h4 className="text-eclipse-text-light dark:text-space-text text-sm font-semibold mb-2">
            Available Topics
          </h4>
          <ul className="space-y-2">
            {availableTags.length > 0 ? (
              availableTags.map((tag, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-eclipse-border/30 dark:hover:bg-space-light/30 transition-all cursor-pointer group"
                >
                  <span className="text-eclipse-text-light dark:text-space-text text-sm">#{tag}</span>
                  <button
                    onClick={() => handleJoinTopic(tag)}
                    className="bg-stellar-blue hover:bg-stellar-blue/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-stellar-blue-glow transition-colors"
                  >
                    Add
                  </button>
                </li>
              ))
            ) : (
              <li className="text-eclipse-muted-light dark:text-space-muted text-sm italic">
                No more topics available
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-stellar-orange hover:bg-stellar-orange/80 text-white rounded-md 
          font-semibold text-sm shadow-stellar-orange-glow transition-all focus:outline-none focus:ring-2 focus:ring-stellar-orange mt-4"
      >
        {isExpanded ? "Collapse Topics" : "+ Join New Topic"}
      </button>
    </motion.div>
  );
};

export default AccentThree;