import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const sidebarItems = [
  { icon: "🏠", text: "Home", path: "/" },
  { icon: "🏆", text: "Contests", path: "/contest" },
  { icon: "📁", text: "Topics", path: "/topics" },
  { icon: "💬", text: "Discussions", path: "/discussions" },
  { icon: "🔑", text: "Profile", path: "/profile" },
  { icon: "🔒", text: "Bookmarks", path: "/bookmarks" },
  { icon: "🔔", text: "Notifications", path: "/notifications" },
];

const footerItems = [
  { icon: "⚙️", text: "Settings", path: "/settings" },
  { icon: "❓", text: "Help", path: "/help" },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-eclipse-surface dark:bg-space-dark border-r border-eclipse-border dark:border-space-gray h-screen sticky top-0"
    >
      <div className="p-4 h-full flex flex-col">
        {/* User Profile */}
        <div className="mb-6 bg-eclipse-surface dark:bg-space-darker rounded-lg overflow-hidden border border-stellar-blue/30">
          <div className="p-0">
            <div className="w-full h-44 bg-eclipse-border dark:bg-space-void flex items-center justify-center">
              <div className="w-20 h-20 bg-eclipse-surface dark:bg-space-dark rounded-full flex items-center justify-center border-2 border-stellar-blue shadow-stellar-blue-glow">
                <span className="text-2xl font-bold text-stellar-blue">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-eclipse-text-light dark:text-space-text font-semibold">{user?.username || 'Anonymous'}</h3>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm">{user?.role || 'Member'}</p>
            <div className="mt-2 flex space-x-2">
              <span className="text-stellar-blue text-xs">✦ {user?.subscribedTopics?.length || 0} Topics</span>
              <span className="text-stellar-green text-xs">◆ Level {user?.level || 1}</span>
            </div>
          </div>
        </div>
        
        {/* Sidebar Menu */}
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5, backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
                className="rounded-md transition-all"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-md transition-colors ${
                      isActive 
                        ? "bg-stellar-blue/20 text-stellar-blue border-l-2 border-stellar-blue" 
                        : "text-eclipse-text-light dark:text-space-text hover:text-stellar-blue"
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
        <div className="mt-auto pt-6">
          <div className="border-t border-eclipse-border dark:border-space-gray pt-4">
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
                          ? "bg-stellar-orange/20 text-stellar-orange border-l-2 border-stellar-orange" 
                          : "text-eclipse-text-light dark:text-space-text hover:text-stellar-orange"
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="text-sm">{item.text}</span>
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
