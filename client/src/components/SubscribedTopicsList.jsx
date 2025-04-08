import { useEffect, useState } from "react";
import useUpdateTags from "../hooks/useUpdateTags";
import { useDispatch, useSelector } from "react-redux";
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
        const tagsArray=Object.keys(response);  //convert object keys to array
        console.log("Fetched tags:", tagsArray);
        setAllTags(tagsArray);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setAllTags([]); // Ensure we fall back to empty array
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
      <div className="p-4 bg-gradient-to-br from-cosmic-primary/90 to-stellar-secondary/90 rounded-lg border border-nebula/30 backdrop-blur-lg">
        <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
          Your Topics
        </h3>
        <p className="text-stardust text-sm italic">Loading...</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-gradient-to-br from-cosmic-primary/90 to-stellar-secondary/90 rounded-lg border border-nebula/30 backdrop-blur-lg">
      <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
        Your Topics
      </h3>

      <ul className="space-y-2 mb-4">
        {user.subscribedTopics && user.subscribedTopics.length > 0 ? (
          user.subscribedTopics.map((topic, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-nebula/10 transition-all cursor-pointer group"
            >
              <span className="text-stardust text-sm">#{topic}</span>
              <button
                onClick={() => handleRemoveTopic(topic)}
                className="bg-supernova text-cosmic text-xs font-bold px-2 py-1 rounded-full hover:brightness-110"
              >
                Remove
              </button>
            </li>
          ))
        ) : (
          <li className="text-stardust text-sm italic">
            No subscribed topics yet.
          </li>
        )}
      </ul>

      {isExpanded && (
        <div className="mt-4 border-t border-nebula/30 pt-4">
          <h4 className="text-stardust text-sm font-semibold mb-2">
            Available Topics
          </h4>
          <ul className="space-y-2">
            {availableTags.length > 0 ? (
              availableTags.map((tag, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-nebula/10 transition-all cursor-pointer group"
                >
                  <span className="text-stardust text-sm">#{tag}</span>
                  <button
                    onClick={() => handleJoinTopic(tag)}
                    className="bg-nebula text-cosmic text-xs font-bold px-2 py-1 rounded-full hover:brightness-110"
                  >
                    Add
                  </button>
                </li>
              ))
            ) : (
              <li className="text-stardust text-sm italic">
                No more topics available
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-md 
          font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-corona mt-4"
      >
        {isExpanded ? "Collapse Topics" : "+ Join New Topic"}
      </button>
    </div>
  );
};
