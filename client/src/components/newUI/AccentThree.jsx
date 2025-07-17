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
        className="bg-cyber-dark rounded-lg p-5 border border-cyber-dark shadow-cyber-orange-glow w-full max-w-xs"
      >
        <h2 className="text-xl font-semibold text-cyber-text mb-4">Your Topics</h2>
        <p className="text-cyber-text/60 text-sm italic">Loading topics...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-cyber-dark rounded-lg p-5 border border-cyber-orange shadow-cyber-orange-glow w-full max-w-xs"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-cyber-text">Your Topics</h2>
        <div className="text-xs text-cyber-orange font-mono mt-1">#FF4500</div>
      </div>
      
      <ul className="space-y-2 mb-4">
        {user.subscribedTopics && user.subscribedTopics.length > 0 ? (
          user.subscribedTopics.map((topic, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-cyber-black/30 transition-all cursor-pointer group"
            >
              <span className="text-cyber-text text-sm">#{topic}</span>
              <button
                onClick={() => handleRemoveTopic(topic)}
                className="bg-cyber-orange hover:bg-cyber-orange/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-cyber-orange-glow transition-colors"
              >
                Remove
              </button>
            </li>
          ))
        ) : (
          <li className="text-cyber-text/60 text-sm italic">
            No subscribed topics yet.
          </li>
        )}
      </ul>

      {isExpanded && (
        <div className="mt-4 border-t border-cyber-orange/30 pt-4">
          <h4 className="text-cyber-text text-sm font-semibold mb-2">
            Available Topics
          </h4>
          <ul className="space-y-2">
            {availableTags.length > 0 ? (
              availableTags.map((tag, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-cyber-black/30 transition-all cursor-pointer group"
                >
                  <span className="text-cyber-text text-sm">#{tag}</span>
                  <button
                    onClick={() => handleJoinTopic(tag)}
                    className="bg-cyber-blue hover:bg-cyber-blue/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-cyber-blue-glow transition-colors"
                  >
                    Add
                  </button>
                </li>
              ))
            ) : (
              <li className="text-cyber-text/60 text-sm italic">
                No more topics available
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-cyber-orange hover:bg-cyber-orange/80 text-white rounded-md 
          font-semibold text-sm shadow-cyber-orange-glow transition-all focus:outline-none focus:ring-2 focus:ring-cyber-orange mt-4"
      >
        {isExpanded ? "Collapse Topics" : "+ Join New Topic"}
      </button>
    </motion.div>
  );
};

export default AccentThree;