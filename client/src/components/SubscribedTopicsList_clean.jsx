import { useEffect, useState } from "react";
import useUpdateTags from "../hooks/useUpdateTags";
import { useSelector } from "react-redux";
import { fetchTagsList } from "../utility/fetchTagsList";

export const SubscribedTopicsList = () => {
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
    (tag) => !user.subscribedTopics.includes(tag)
  );

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Your Topics
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Your Topics
      </h3>

      <ul className="space-y-2 mb-4">
        {user.subscribedTopics && user.subscribedTopics.length > 0 ? (
          user.subscribedTopics.map((topic, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-200"
            >
              <span className="text-gray-700 text-sm">#{topic}</span>
              <button
                onClick={() => handleRemoveTopic(topic)}
                className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-2 py-1 rounded-full transition-colors"
              >
                Remove
              </button>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-sm italic">
            No subscribed topics yet.
          </li>
        )}
      </ul>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-gray-700 text-sm font-semibold mb-2">
            Available Topics
          </h4>
          <ul className="space-y-2">
            {availableTags.length > 0 ? (
              availableTags.map((tag, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-200"
                >
                  <span className="text-gray-700 text-sm">#{tag}</span>
                  <button
                    onClick={() => handleJoinTopic(tag)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2 py-1 rounded-full transition-colors"
                  >
                    Add
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm italic">
                No additional topics available
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
          font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
      >
        {isExpanded ? "Collapse Topics" : "Browse Topics"}
      </button>
    </div>
  );
};
