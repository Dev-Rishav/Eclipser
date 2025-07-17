import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const sidebarItems = [
  { icon: "📋", text: "Feed", path: "/" },
  { icon: "🏆", text: "Contests", path: "/contest" },
  { icon: "📁", text: "Topics", path: "/topics" },
  { icon: "�", text: "Discussions", path: "/discussions" },
  { icon: "⚡", text: "Leaderboard", path: "/leaderboard" },
  { icon: "🔑", text: "Profile", path: "/profile" },
  { icon: "📊", text: "Analytics", path: "/analytics" },
  { icon: "🔄", text: "Recent", path: "/recent" },
  { icon: "🔒", text: "Bookmarks", path: "/bookmarks" },
  { icon: "🛠️", text: "Settings", path: "/settings" },
  { icon: "📝", text: "Drafts", path: "/drafts" },
  { icon: "📦", text: "Projects", path: "/projects" },
  { icon: "🔔", text: "Notifications", path: "/notifications" },
  { icon: "🌐", text: "Explorer", path: "/explorer" },
  { icon: "📱", text: "Mobile", path: "/mobile" },
  { icon: "🔗", text: "Integrations", path: "/integrations" },
];

const footerItems = [
  { icon: "⚙️", text: "Settings", path: "/settings" },
  { icon: "🔐", text: "Privacy", path: "/privacy" },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-cyber-black border-r border-cyber-dark h-screen sticky top-0"
    >
      <div className="p-4">
        {/* User Profile */}
        <div className="mb-6 bg-cyber-dark rounded-lg overflow-hidden border border-cyber-blue/30">
          <div className="p-0">
            <div className="w-full h-44 bg-gradient-to-br from-cyber-blue via-cyber-purple to-cyber-orange flex items-center justify-center">
              <div className="w-20 h-20 bg-cyber-black rounded-full flex items-center justify-center border-2 border-cyber-blue shadow-cyber-blue-glow">
                <span className="text-2xl font-bold text-cyber-blue">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-cyber-text font-semibold">{user?.username || 'Anonymous'}</h3>
            <p className="text-cyber-text/60 text-sm">{user?.role || 'Member'}</p>
            <div className="mt-2 flex space-x-2">
              <span className="text-cyber-blue text-xs">✦ {user?.subscribedTopics?.length || 0} Topics</span>
              <span className="text-cyber-green text-xs">◆ Level {user?.level || 1}</span>
            </div>
          </div>
        </div>
        
        {/* Sidebar Menu */}
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5, backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                className="rounded-md transition-all"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-md transition-colors ${
                      isActive 
                        ? "bg-cyber-blue/20 text-cyber-blue border-l-2 border-cyber-blue" 
                        : "text-cyber-text hover:text-cyber-blue"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.text}</span>
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* Footer Menu */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="border-t border-cyber-dark pt-4">
            <ul className="space-y-2">
              {footerItems.map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255, 69, 0, 0.1)' }}
                  className="rounded-md transition-all"
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-md transition-colors ${
                        isActive 
                          ? "bg-cyber-orange/20 text-cyber-orange border-l-2 border-cyber-orange" 
                          : "text-cyber-text hover:text-cyber-orange"
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.text}</span>
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