import React from 'react';
import { updateTopic } from '../utility/updateTopic';

export const SubscribedTopicsList = () => {
  const [user, setUser] = React.useState(null);
  const [isRemoving,setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  if (!user) {
    return (
      <div className="p-4 bg-gradient-to-br from-cosmic-primary/90 to-stellar-secondary/90 rounded-lg border border-nebula/30 backdrop-blur-lg">
        <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
          Your Topics
        </h3>
        <p className="text-stardust text-sm italic">Loading...</p>
      </div>
    );
  }


  const handleJoinTopic = (targetTopic) => {
    if(isRemoving)
      setIsRemoving(false);
    updateTopic(targetTopic, user, setUser,isRemoving);
  };

  const handleRemoveTopic = (targetTopic) => {
    if(!isRemoving)
      setIsRemoving(true);
    updateTopic(targetTopic,user, setUser,isRemoving);
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
          <li className="text-stardust text-sm italic">No subscribed topics yet.</li>
        )}
      </ul>

      <button
        onClick={() => handleJoinTopic('NewTopic')} // Example: Add a new topic
        className="w-full py-2 px-4 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-md 
          font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-corona"
      >
        + Join New Topic
      </button>
    </div>
  );
};