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
      <div className="absolute inset-0 rounded-lg bg-cyber-green opacity-20 blur-sm"></div>
      
      <div className="relative bg-cyber-dark rounded-lg p-3 border border-cyber-green shadow-cyber-green-glow">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-cyber-text">User Profile</h2>
            <div className="mt-1 text-cyber-green text-sm font-mono">
              <div>{'#' + (user?.id || user?._id || 'N/A').toString().slice(-5)}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyber-green hover:text-cyber-blue transition-colors"
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
        <div className="mb-3 p-2 rounded-lg border border-cyber-green/30 bg-cyber-black/50">
          <h3 className="text-xs font-semibold text-cyber-green mb-2 flex items-center">
            <div className="w-1.5 h-1.5 bg-cyber-green rounded-full mr-2 animate-cyber-pulse"></div>
            Profile Object
          </h3>
          <div className="text-xs font-mono text-cyber-text">
            <div className="text-cyber-blue">{'{'}</div>
            <div className="ml-2">
              <span className="text-cyber-orange">&quot;username&quot;</span>
              <span className="text-cyber-text">: </span>
              <span className="text-cyber-green">&quot;{user?.username || 'Guest'}&quot;</span>
              <span className="text-cyber-text">,</span>
            </div>
            <div className="ml-2">
              <span className="text-cyber-orange">&quot;email&quot;</span>
              <span className="text-cyber-text">: </span>
              <span className="text-cyber-green">&quot;{user?.email || 'Not logged in'}&quot;</span>
            </div>
            <div className="ml-2">
              <span className="text-cyber-orange">&quot;achievements&quot;</span>
              <span className="text-cyber-text">: </span>
              <span className="text-cyber-green">&quot;{user?.achievementTitle || 'Not logged in'}&quot;</span>
            </div>
            <div className="text-cyber-blue">{'}'}</div>
          </div>
        </div>

        {/* Collapsed Status */}
        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 rounded-lg border border-cyber-green/30 bg-cyber-green/10"
          >
            <div className="flex items-center justify-center text-xs">
              <div className="w-1.5 h-1.5 bg-cyber-green rounded-full mr-2 animate-cyber-pulse"></div>
              <span className="font-mono font-semibold text-cyber-green">
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
              <h3 className="text-xs font-semibold text-cyber-green mb-2 flex items-center">
                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full mr-2 animate-cyber-pulse"></div>
                Achievements
              </h3>
              <div className="space-y-1">
                <div className="p-2 rounded-lg border border-cyber-green/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyber-text">Current Title:</span>
                    <span className="text-xs font-mono text-cyber-green">
                      {user?.achievementTitle || 'New Explorer'}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-cyber-blue/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyber-text">Rank Level:</span>
                    <span className="text-xs font-mono text-cyber-blue">
                      {user?.level || '1'}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-cyber-purple/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyber-text">Total Points:</span>
                    <span className="text-xs font-mono text-cyber-purple">
                      {user?.totalPoints || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status in Expanded View */}
            <div>
              <h3 className="text-xs font-semibold text-cyber-green mb-2 flex items-center">
                <div className="w-1.5 h-1.5 bg-cyber-green rounded-full mr-2 animate-cyber-pulse"></div>
                System Health
              </h3>
              <div className="space-y-1">
                <div className="p-2 rounded-lg border border-cyber-green/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyber-text/60">Main Service:</span>
                    <span className="font-mono text-cyber-green">UP</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-cyber-blue/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyber-text/60">Contest Service:</span>
                    <span className="font-mono text-cyber-green">UP</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-cyber-purple/20 bg-cyber-black/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyber-text/60">Chat Service:</span>
                    <span className="font-mono text-cyber-green">UP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 font-mono text-sm text-cyber-green shadow-cyber-green-glow text-center">
              #22FF22
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Status;