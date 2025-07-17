import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions/authActions";
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
      className="flex items-center justify-between p-4 border-b border-cyber-dark bg-cyber-black/95 backdrop-blur-lg text-cyber-text"
    >
      <div className="flex items-center">
        <div className="mr-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-white">ECLIPSER</span>
          </div>
        </div>
        
        <ul className="flex space-x-8">
          <li>
            <NavLink 
              to="/topics" 
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-cyber-blue text-cyber-blue shadow-cyber-blue-glow" : "border-transparent hover:border-cyber-blue hover:text-cyber-blue"
                }`
              }
            >
              Topics
            </NavLink>
          </li>
          <li className="flex items-center">
            <NavLink 
              to="/contest"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-cyber-purple shadow-cyber-purple-glow" : "hover:text-cyber-purple"
                }`
              }
            >
              Contests
            </NavLink>
            <svg className="w-4 h-4 ml-1 text-cyber-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </li>
          <li>
            <NavLink 
              to="/discussions" 
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-cyber-green shadow-cyber-green-glow" : "hover:text-cyber-green"
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
                `transition-colors ${
                  isActive ? "text-cyber-blue shadow-cyber-blue-glow" : "hover:text-cyber-blue"
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
                `transition-colors ${
                  isActive ? "text-cyber-orange shadow-cyber-orange-glow" : "hover:text-cyber-orange"
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
            className="w-48 pl-8 pr-4 py-2 bg-cyber-dark border border-cyber-dark rounded-full text-cyber-text placeholder-cyber-text/60 focus:w-64 focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue focus:shadow-cyber-blue-glow transition-all"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-cyber-blue shadow-cyber-blue-glow"></div>
        </div>

        {isAuthenticated ? (
          <>
            {/* Notification Button */}
            <button className="relative text-cyber-text hover:text-cyber-blue hover:shadow-cyber-blue-glow transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-cyber-orange text-white rounded-full shadow-cyber-orange-glow">
                3
              </span>
            </button>

            <div className="flex items-center space-x-3">

              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-3 py-1 text-sm bg-cyber-dark hover:bg-cyber-dark/80 text-cyber-text hover:text-cyber-orange rounded-lg transition-colors border border-cyber-dark hover:border-cyber-orange"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <NavLink
                to="/login"
                className="px-4 py-2 text-sm text-cyber-text hover:text-cyber-blue transition-colors"
              >
                Login
              </NavLink>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink
                  to="/signup"
                  className="bg-cyber-orange hover:bg-cyber-orange/80 text-white px-4 py-2 rounded-lg shadow-cyber-orange-glow transition-colors"
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
        <div className="fixed inset-0 bg-cyber-black/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-cyber-dark border border-cyber-dark rounded-lg p-6 max-w-sm mx-4 shadow-cyber-blue-glow">
            <h3 className="text-lg font-semibold text-cyber-text mb-4">
              Confirm Logout
            </h3>
            <p className="text-cyber-text/80 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-cyber-text hover:text-cyber-blue transition-colors border border-cyber-dark hover:border-cyber-blue rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm bg-cyber-orange hover:bg-cyber-orange/80 text-white rounded-lg transition-colors shadow-cyber-orange-glow"
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