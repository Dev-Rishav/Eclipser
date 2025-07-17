import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-gray-900/95 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center">
            <div className="mr-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">ECLIPSER</span>
              </div>
            </div>
            
            <ul className="hidden md:flex space-x-8">
              <li>
                <motion.div whileHover={{ y: -2 }}>
                  <NavLink 
                    to="/topics" 
                    className={({ isActive }) =>
                      `border-b-2 pb-1 transition-colors ${
                        isActive ? "border-accent-blue text-accent-blue shadow-neon-blue" : "border-transparent text-gray-300 hover:text-accent-blue"
                      }`
                    }
                  >
                    Topics
                  </NavLink>
                </motion.div>
              </li>
              <li className="flex items-center">
                <motion.div whileHover={{ y: -2 }} className="flex items-center">
                  <NavLink 
                    to="/contest"
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive ? "text-accent-cyan shadow-neon-cyan" : "text-gray-300 hover:text-accent-cyan"
                      }`
                    }
                  >
                    Contests
                  </NavLink>
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ y: -2 }}>
                  <NavLink 
                    to="/discussions"
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive ? "text-accent-green shadow-neon-green" : "text-gray-300 hover:text-accent-green"
                      }`
                    }
                  >
                    Discussions
                  </NavLink>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ y: -2 }}>
                  <NavLink 
                    to="/help"
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive ? "text-accent-cyan shadow-neon-cyan" : "text-gray-300 hover:text-accent-cyan"
                      }`
                    }
                  >
                    Help
                  </NavLink>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-48 pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:w-64 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue focus:shadow-neon-blue transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-accent-cyan shadow-neon-cyan"></div>
            </div>

            {isAuthenticated ? (
              <>
                {/* Notification Button */}
                <button className="relative text-gray-300 hover:text-accent-cyan hover:shadow-neon-cyan transition-colors">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-accent-red text-white rounded-full shadow-neon-red">
                    3
                  </span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan font-bold text-white cursor-pointer shadow-neon-blue"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                      alt="Profile"
                    >
                      {user?.username[0].toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent-green border-2 border-gray-900 shadow-neon-green"></div>
                  </div>

                  <div className="flex flex-col cursor-pointer">
                    <span
                      className="text-sm text-white font-medium hover:text-accent-cyan transition-colors"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                    >
                      {user?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user?.role || "Member"}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Login/Signup buttons with new styling */}
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-300 hover:text-accent-cyan transition-colors"
                  >
                    Login
                  </NavLink>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NavLink
                      to="/signup"
                      className="px-4 py-2 text-sm bg-accent-red hover:bg-red-600 text-white rounded-lg transition-colors shadow-neon-red"
                    >
                      Sign Up
                    </NavLink>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm bg-accent-red hover:bg-red-700 text-white rounded-lg transition-colors shadow-neon-red"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
