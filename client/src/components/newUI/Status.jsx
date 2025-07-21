import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const Status = () => {
  const { user } = useSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative max-w-xs w-full"
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-lg bg-stellar-green opacity-20 blur-sm"></div>
      
      <div className="relative bg-eclipse-surface dark:bg-space-darker rounded-lg p-3 border border-stellar-green/50 shadow-stellar-green-glow animate-edge-glow">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-eclipse-text-light dark:text-space-text">User Profile</h2>
            <div className="mt-1 text-stellar-green text-sm font-mono">
              <div>{'#' + (user?.id || user?._id || 'N/A').toString().slice(-5)}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stellar-green hover:text-stellar-blue transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        
        {/* User Information */}
        <div className="mb-3 p-2 rounded-lg border border-stellar-green/30 bg-eclipse-border/50 dark:bg-space-void">
          <h3 className="text-xs font-semibold text-stellar-green mb-2 flex items-center">
            <div className="w-1.5 h-1.5 bg-stellar-green rounded-full mr-2 animate-stellar-pulse"></div>
            Profile Object
          </h3>
          <div className="text-xs font-mono text-eclipse-text-light dark:text-space-text">
            <div className="text-stellar-blue">{'{'}</div>
            <div className="ml-2">
              <span className="text-stellar-orange">&quot;username&quot;</span>
              <span className="text-eclipse-text-light dark:text-space-text">: </span>
              <span className="text-stellar-green">&quot;{user?.username || 'Guest'}&quot;</span>
              <span className="text-eclipse-text-light dark:text-space-text">,</span>
            </div>
            <div className="ml-2">
              <span className="text-stellar-orange">&quot;email&quot;</span>
              <span className="text-eclipse-text-light dark:text-space-text">: </span>
              <span className="text-stellar-green">&quot;{user?.email || 'Not logged in'}&quot;</span>
            </div>
            <div className="ml-2">
              <span className="text-stellar-orange">&quot;achievements&quot;</span>
              <span className="text-eclipse-text-light dark:text-space-text">: </span>
              <span className="text-stellar-green">&quot;{user?.achievements || 'Not logged in'}&quot;</span>
            </div>
            <div className="text-stellar-blue">{'}'}</div>
          </div>
        </div>

        {/* Collapsed Status */}
        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 rounded-lg border border-stellar-green/30 bg-stellar-green/10"
          >
            <div className="flex items-center justify-center text-xs">
              <div className="w-1.5 h-1.5 bg-stellar-green rounded-full mr-2 animate-stellar-pulse"></div>
              <span className="font-mono font-semibold text-stellar-green">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </motion.div>
        )}

        {/* Expanded Achievement Section */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Achievement Section */}
            <div>
              <h3 className="text-xs font-semibold text-stellar-green mb-2 flex items-center">
                <div className="w-1.5 h-1.5 bg-stellar-green rounded-full mr-2 animate-stellar-pulse"></div>
                Achievements
              </h3>
              <div className="space-y-1">
                <div className="p-2 rounded-lg border border-stellar-green/20 bg-space-void">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-space-text">Current Title:</span>
                    <span className="text-xs font-mono text-stellar-green">
                      {user?.achievementTitle || 'New Explorer'}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-stellar-blue/20 bg-space-void">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-space-text">Rank Level:</span>
                    <span className="text-xs font-mono text-stellar-blue">
                      {user?.level || '1'}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-stellar-orange/20 bg-space-void">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-space-text">Total Points:</span>
                    <span className="text-xs font-mono text-stellar-orange">
                      {user?.totalPoints || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status in Expanded View */}
            <div>
              <h3 className="text-xs font-semibold text-stellar-green mb-2 flex items-center">
                <div className="w-1.5 h-1.5 bg-stellar-green rounded-full mr-2 animate-stellar-pulse"></div>
                System Health
              </h3>
              <div className="space-y-1">
                <div className="p-2 rounded-lg border border-stellar-green/20 bg-space-void">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-space-muted">Main Service:</span>
                    <span className="font-mono text-stellar-green">UP</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-stellar-blue/20 bg-space-void">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-space-muted">Contest Service:</span>
                    <span className="font-mono text-stellar-green">UP</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-stellar-orange/20 bg-space-void">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-space-muted">Chat Service:</span>
                    <span className="font-mono text-stellar-green">UP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 font-mono text-sm text-stellar-green shadow-stellar-green-glow text-center">
              #22FF22
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Status;