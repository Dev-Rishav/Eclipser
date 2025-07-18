import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from "../ThemeSwitcher";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContestDropdown, setShowContestDropdown] = useState(false);
  const notificationRef = useRef(null);
  const contestRef = useRef(null);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (contestRef.current && !contestRef.current.contains(event.target)) {
        setShowContestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'contest',
      title: 'New Contest Available',
      message: 'CodeJam 2025 is now live! Join before time runs out.',
      time: '2 min ago',
      read: false,
      icon: '🏆'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You earned the "Problem Solver" badge!',
      time: '1 hour ago',
      read: false,
      icon: '🏅'
    },
    {
      id: 3,
      type: 'post',
      title: 'New Reply',
      message: 'Someone replied to your discussion about algorithms.',
      time: '3 hours ago',
      read: true,
      icon: '💬'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/95 dark:bg-space-dark/95 backdrop-blur-lg text-eclipse-text-light dark:text-space-text"
    >
      <div className="flex items-center">
        <div className="mr-6">
          <NavLink to="/" className="flex items-center">
            <div className="w-10 h-10 bg-stellar-blue rounded-full flex items-center justify-center shadow-stellar-blue-glow hover:bg-stellar-blue/80 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-stellar-blue hover:text-stellar-blue/80 transition-colors">ECLIPSER</span>
          </NavLink>
        </div>
        
        <ul className="flex space-x-8">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-blue" : "border-transparent hover:border-stellar-blue"
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/topics" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-blue" : "border-transparent hover:border-stellar-blue"
                }`
              }
            >
              Topics
            </NavLink>
          </li>
          <li className="relative" ref={contestRef}>
            <button
              onClick={() => setShowContestDropdown(!showContestDropdown)}
              className={`flex items-center border-b-2 pb-1 transition-colors ${
                showContestDropdown ? "border-stellar-orange" : "border-transparent hover:border-stellar-orange"
              }`}
            >
              <NavLink 
                to="/contest"
                className="text-eclipse-text-light dark:text-space-text hover:text-stellar-orange transition-colors"
              >
                Contests
              </NavLink>
              <motion.svg 
                animate={{ rotate: showContestDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 ml-1 text-eclipse-muted-light dark:text-space-muted" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            {/* Contest Dropdown */}
            <AnimatePresence>
              {showContestDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg shadow-space-elevated z-[60] overflow-hidden"
                >
                  <div className="py-2">
                    <NavLink
                      to="/contest"
                      className="block px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border dark:hover:bg-space-gray transition-colors"
                      onClick={() => setShowContestDropdown(false)}
                    >
                      🏆 Active Contests
                    </NavLink>
                    <NavLink
                      to="/contest/upcoming"
                      className="block px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border dark:hover:bg-space-gray transition-colors"
                      onClick={() => setShowContestDropdown(false)}
                    >
                      ⏰ Upcoming
                    </NavLink>
                    <NavLink
                      to="/contest/results"
                      className="block px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border dark:hover:bg-space-gray transition-colors"
                      onClick={() => setShowContestDropdown(false)}
                    >
                      📊 Results
                    </NavLink>
                    <NavLink
                      to="/contest/practice"
                      className="block px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border dark:hover:bg-space-gray transition-colors"
                      onClick={() => setShowContestDropdown(false)}
                    >
                      💪 Practice
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li>
            <NavLink 
              to="/discussions" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-blue" : "border-transparent hover:border-stellar-blue"
                }`
              }
            >
              Discussions
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/help" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-green" : "border-transparent hover:border-stellar-green"
                }`
              }
            >
              Help
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/leaderboard" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-orange" : "border-transparent hover:border-stellar-orange"
                }`
              }
            >
              Leaderboard
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-48 pl-8 pr-4 py-2 bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-full text-eclipse-text-light dark:text-space-text placeholder-eclipse-muted-light dark:placeholder-space-muted focus:w-64 focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-stellar-blue shadow-stellar-blue-glow"></div>
        </div>

        {isAuthenticated ? (
          <>
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors p-2 rounded-lg hover:bg-eclipse-border dark:hover:bg-space-gray"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19H6.5a2.5 2.5 0 010-5H9m-4-4h11a2 2 0 012 2v2a2 2 0 01-2 2H9"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg shadow-space-elevated z-[60] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-eclipse-border dark:border-space-gray bg-eclipse-border/50 dark:bg-space-gray/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-eclipse-text-light dark:text-space-text">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-stellar-blue">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto notification-scroll">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            whileHover={{ backgroundColor: "rgba(123, 104, 238, 0.05)" }}
                            className={`px-4 py-3 border-b border-eclipse-border dark:border-space-gray/50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-stellar-blue/5' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 text-xl">
                                {notification.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-eclipse-text-light dark:text-space-text truncate">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-stellar-blue rounded-full flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                <p className="text-xs text-eclipse-muted-light dark:text-space-muted mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-eclipse-muted-light dark:text-space-muted mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="text-4xl mb-2">🔔</div>
                          <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-eclipse-border dark:border-space-gray bg-eclipse-border/50 dark:bg-space-gray/50">
                        <button className="w-full text-sm text-stellar-blue hover:text-stellar-blue/80 transition-colors text-center">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-3 py-1 text-sm bg-eclipse-surface dark:bg-space-darker hover:bg-eclipse-border dark:hover:bg-space-light text-eclipse-text-light dark:text-space-text hover:text-stellar-orange rounded-lg transition-colors border border-eclipse-border dark:border-space-gray hover:border-stellar-orange"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              {/* Theme Switcher for non-authenticated users */}
              <ThemeSwitcher />
              
              <NavLink
                to="/login"
                className="px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:text-stellar-blue transition-colors"
              >
                Login
              </NavLink>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink
                  to="/signup"
                  className="bg-stellar-blue hover:bg-stellar-blue/80 text-white px-4 py-2 rounded-lg shadow-stellar-blue-glow transition-colors"
                >
                  Sign Up
                </NavLink>
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-space-void/75 dark:bg-space-void/90 backdrop-blur-sm flex items-center justify-center z-[70]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg p-6 max-w-sm mx-4 shadow-space-card dark:shadow-stellar-blue-glow"
          >
            <h3 className="text-lg font-semibold text-eclipse-text-light dark:text-space-text mb-4">
              Confirm Logout
            </h3>
            <p className="text-eclipse-muted-light dark:text-space-muted mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:text-stellar-blue transition-colors border border-eclipse-border dark:border-space-gray hover:border-stellar-blue rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm bg-stellar-orange hover:bg-stellar-orange/80 text-white rounded-lg transition-colors shadow-stellar-orange-glow"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;