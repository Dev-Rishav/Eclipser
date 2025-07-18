import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from 'framer-motion';
import ThemeSwitcher from "../ThemeSwitcher";

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
      className="flex items-center justify-between p-4 border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/95 dark:bg-space-dark/95 backdrop-blur-lg text-eclipse-text-light dark:text-space-text"
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
          <li className="flex items-center">
            <NavLink 
              to="/contest"
              className={({ isActive }) =>
                `border-b-2 pb-1 transition-colors ${
                  isActive ? "border-stellar-orange" : "border-transparent hover:border-stellar-orange"
                }`
              }
            >
              Contests
            </NavLink>
            <svg className="w-4 h-4 ml-1 text-eclipse-muted-light dark:text-space-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
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
            
            {/* Notification Button */}
            <button className="relative text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full">
                3
              </span>
            </button>

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
        <div className="fixed inset-0 bg-space-void/75 dark:bg-space-void/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg p-6 max-w-sm mx-4 shadow-space-card dark:shadow-stellar-blue-glow">
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
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;