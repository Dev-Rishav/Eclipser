import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaRocket, FaTag, FaClock, FaFilter } from 'react-icons/fa';
import PropTypes from 'prop-types';

const PersonalizationBanner = ({ feedType, onSubscribeTopics }) => {
  const { user } = useSelector((state) => state.auth);
  const hasSubscribedTopics = user?.subscribedTopics?.length > 0;

  if (hasSubscribedTopics && feedType === 'personalized') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-stellar-blue/10 via-stellar-green/10 to-stellar-purple/10 border border-stellar-blue/30 rounded-xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/5 to-stellar-green/5 animate-pulse"></div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-stellar-blue to-stellar-green rounded-full flex items-center justify-center shadow-stellar-blue-glow">
            <FaFilter className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-eclipse-text-light dark:text-space-text flex items-center gap-2">
              <FaRocket className="text-stellar-blue" />
              Personalized Feed Active
            </h3>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm">
              Showing posts from your {user.subscribedTopics.length} subscribed topics: {' '}
              <span className="text-stellar-blue font-medium">
                {user.subscribedTopics.slice(0, 3).map(topic => `#${topic}`).join(', ')}
                {user.subscribedTopics.length > 3 && ` +${user.subscribedTopics.length - 3} more`}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!hasSubscribedTopics && feedType === 'general') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-stellar-orange/10 via-stellar-purple/10 to-stellar-blue/10 border border-stellar-orange/30 rounded-xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stellar-orange/5 to-stellar-purple/5 animate-pulse"></div>
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-stellar-orange to-stellar-purple rounded-full flex items-center justify-center shadow-stellar-orange-glow">
              <FaClock className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-eclipse-text-light dark:text-space-text mb-2 flex items-center gap-2">
                <FaTag className="text-stellar-orange" />
                General Feed Mode
              </h3>
              <p className="text-eclipse-muted-light dark:text-space-muted text-sm mb-4">
                Currently showing all posts sorted by time. Subscribe to topics for personalized content!
              </p>
              <div className="bg-stellar-blue/10 border border-stellar-blue/30 rounded-lg p-4">
                <p className="text-stellar-blue text-sm font-medium mb-2">
                  🚀 Why subscribe to topics?
                </p>
                <ul className="text-eclipse-muted-light dark:text-space-muted text-xs space-y-1">
                  <li>• Get content tailored to your interests</li>
                  <li>• Priority posts from topics you care about</li>
                  <li>• Discover new content in your field</li>
                  <li>• Better engagement with relevant discussions</li>
                </ul>
              </div>
              {onSubscribeTopics && (
                <button
                  onClick={onSubscribeTopics}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-stellar-orange to-stellar-blue text-white rounded-lg font-semibold text-sm shadow-stellar-orange-glow hover:shadow-stellar-blue-glow transition-all hover:scale-105"
                >
                  🎯 Explore Topics
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

PersonalizationBanner.propTypes = {
  feedType: PropTypes.oneOf(['personalized', 'general']).isRequired,
  onSubscribeTopics: PropTypes.func,
};

export default PersonalizationBanner;
