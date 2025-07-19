import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const sidebarItems = [
  { icon: "🏠", text: "Home", path: "/", desc: "Main Terminal" },
  { icon: "🏆", text: "Contests", path: "/contest", desc: "Battle Arena" },
  { icon: "📁", text: "Topics", path: "/topics", desc: "Knowledge Base" },
  { icon: "💬", text: "Comms", path: "/discussions", desc: "Chat Networks" },
  { icon: "🔑", text: "Profile", path: "/profile", desc: "Operator Status" },
  { icon: "🔒", text: "Vault", path: "/bookmarks", desc: "Secured Files" },
  { icon: "�", text: "Alerts", path: "/notifications", desc: "Incoming Signals" },
];

const footerItems = [
  { icon: "⚙️", text: "Config", path: "/settings", desc: "System Settings" },
  { icon: "🛟", text: "Support", path: "/help", desc: "Emergency Line" },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-b from-eclipse-surface/95 to-eclipse-border/95 dark:from-space-darker/95 dark:to-space-dark/95 border border-stellar-blue/20 rounded-lg backdrop-blur-sm shadow-lg"
    >
      <div className="p-4 flex flex-col">
        {/* Operator Profile */}
        <motion.div 
          className="mb-6 bg-gradient-to-br from-eclipse-surface/80 to-eclipse-border/60 dark:from-space-darker/80 dark:to-space-dark/60 rounded-xl overflow-hidden border border-stellar-blue/30 shadow-lg"
          whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-0 relative">
            <div className="w-full h-44 bg-gradient-to-br from-eclipse-border via-eclipse-surface to-eclipse-border dark:from-space-void dark:via-space-dark dark:to-space-darker flex items-center justify-center relative overflow-hidden">
              {/* Floating particles */}
              <motion.div
                animate={{ 
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute w-1 h-1 bg-stellar-blue rounded-full"
                style={{ top: '20%', left: '20%' }}
              />
              <motion.div
                animate={{ 
                  x: [0, -80, 0],
                  y: [0, 60, 0],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute w-1 h-1 bg-stellar-purple rounded-full"
                style={{ top: '70%', left: '80%' }}
              />
              
              <motion.div 
                className="relative w-20 h-20 bg-gradient-to-br from-stellar-blue to-stellar-purple rounded-full flex items-center justify-center border-2 border-stellar-blue/50 shadow-stellar-blue-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ boxShadow: ["0 0 20px rgba(59, 130, 246, 0.3)", "0 0 30px rgba(59, 130, 246, 0.6)", "0 0 20px rgba(59, 130, 246, 0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl font-bold text-white font-mono">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
                
                {/* Status indicator */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-stellar-green rounded-full border-2 border-eclipse-surface dark:border-space-darker shadow-stellar-green-glow"
                />
              </motion.div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-stellar-blue/5 to-stellar-purple/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-eclipse-text-light dark:text-space-text font-bold font-mono uppercase tracking-wide">
                {user?.username || 'ANONYMOUS'}
              </h3>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-1 bg-stellar-green/20 border border-stellar-green/30 rounded text-xs font-mono uppercase text-stellar-green"
              >
                ONLINE
              </motion.div>
            </div>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm font-mono uppercase tracking-wider mb-3">
              {user?.role || 'OPERATIVE'} • CLEARANCE LVL {user?.level || 1}
            </p>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wide">
              <div className="text-center">
                <div className="text-stellar-blue font-bold">{user?.subscribedTopics?.length || 0}</div>
                <div className="text-stellar-blue/60">TOPICS</div>
              </div>
              <div className="text-center">
                <div className="text-stellar-purple font-bold">{user?.totalPosts || 0}</div>
                <div className="text-stellar-purple/60">POSTS</div>
              </div>
              <div className="text-center">
                <div className="text-stellar-orange font-bold">{user?.reputation || 0}</div>
                <div className="text-stellar-orange/60">REP</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Navigation Control Panel */}
        <nav>
          <div className="flex items-center gap-2 mb-4 px-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-stellar-green rounded-full shadow-stellar-green-glow"
            />
            <h4 className="text-xs font-bold text-stellar-green uppercase tracking-wider font-mono">
              NAV SYSTEMS
            </h4>
          </div>
          
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                className="rounded-lg transition-all group"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-3 px-3 rounded-lg transition-all font-mono ${
                      isActive 
                        ? "bg-gradient-to-r from-stellar-blue/20 to-stellar-blue/10 text-stellar-blue border border-stellar-blue/30 shadow-stellar-blue-glow" 
                        : "text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-blue border border-transparent hover:border-stellar-blue/20"
                    }`
                  }
                >
                  <motion.span 
                    className="mr-3 text-lg"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.span>
                  <div className="flex-1">
                    <span className="text-sm font-bold uppercase tracking-wide">{item.text}</span>
                    <div className="text-xs opacity-60 uppercase tracking-wider">{item.desc}</div>
                  </div>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 text-stellar-blue"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* System Footer */}
        <div className="pt-6">
          <div className="border-t border-stellar-orange/20 pt-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-stellar-orange rounded-full shadow-stellar-orange-glow"
              />
              <h4 className="text-xs font-bold text-stellar-orange uppercase tracking-wider font-mono">
                SYS ADMIN
              </h4>
            </div>
            
            <ul className="space-y-1">
              {footerItems.map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 8, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                  className="rounded-lg transition-all group"
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center py-3 px-3 rounded-lg transition-all font-mono ${
                        isActive 
                          ? "bg-gradient-to-r from-stellar-orange/20 to-stellar-orange/10 text-stellar-orange border border-stellar-orange/30 shadow-stellar-orange-glow" 
                          : "text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-orange border border-transparent hover:border-stellar-orange/20"
                      }`
                    }
                  >
                    <motion.span 
                      className="mr-3 text-lg"
                      whileHover={{ scale: 1.2, rotate: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.span>
                    <div className="flex-1">
                      <span className="text-sm font-bold uppercase tracking-wide">{item.text}</span>
                      <div className="text-xs opacity-60 uppercase tracking-wider">{item.desc}</div>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 text-stellar-orange"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
