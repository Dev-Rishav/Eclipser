import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

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
    <nav className="fixed top-0 w-full z-50 bg-eclipse-surface dark:bg-space-dark border-b border-eclipse-border dark:border-space-gray backdrop-blur-lg bg-eclipse-surface/90 dark:bg-space-dark/90">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className="text-2xl font-bold text-eclipse-text-light dark:text-space-text"
            >
              ECLIPSER
            </NavLink>

            <div className="hidden md:flex space-x-6">
              <NavLink
                to="/topics"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-stellar-blue" : "text-eclipse-muted-light dark:text-space-muted"
                  } hover:text-stellar-blue transition-colors`
                }
              >
                <span className="w-2 h-2 rounded-full bg-stellar-blue mr-2"></span>
                Topics
              </NavLink>
              <NavLink
                to="/contest"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-stellar-orange" : "text-eclipse-muted-light dark:text-space-muted"
                  } hover:text-stellar-orange transition-colors`
                }
              >
                <span className="w-2 h-2 rounded-full bg-stellar-orange mr-2"></span>
                Contests
              </NavLink>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-48 pl-8 pr-4 py-2 bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-full text-eclipse-text-light dark:text-space-text placeholder-eclipse-muted-light dark:placeholder-space-muted focus:w-64 focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-eclipse-muted-light dark:bg-space-muted"></div>
            </div>

            <ThemeSwitcher />

            {isAuthenticated ? (
              <>
                <button className="relative text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full">
                    3
                  </span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-stellar-blue font-bold text-white cursor-pointer shadow-stellar-blue-glow"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                      alt="Profile"
                    >
                      {user?.username[0].toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-stellar-green border-2 border-eclipse-surface dark:border-space-dark"></div>
                  </div>

                  <div className="flex flex-col cursor-pointer">
                    <span
                      className="text-sm text-eclipse-text-light dark:text-space-text font-medium"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                    >
                      {user?.username}
                    </span>
                    <span className="text-xs text-eclipse-muted-light dark:text-space-muted">
                      {user?.role || "Member"}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-3 py-1 text-sm bg-eclipse-border dark:bg-space-gray hover:bg-eclipse-muted-light dark:hover:bg-space-light text-eclipse-text-light dark:text-space-text rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm text-eclipse-muted-light dark:text-space-muted hover:text-eclipse-text-light dark:hover:text-space-text transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 text-sm bg-stellar-blue hover:bg-stellar-blue/80 text-white rounded-lg transition-colors shadow-stellar-blue-glow"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-eclipse-surface dark:bg-space-darker rounded-lg p-6 max-w-sm mx-4 border border-eclipse-border dark:border-space-gray shadow-space-elevated">
            <h3 className="text-lg font-semibold text-eclipse-text-light dark:text-space-text mb-4">
              Confirm Logout
            </h3>
            <p className="text-eclipse-muted-light dark:text-space-muted mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-eclipse-muted-light dark:text-space-muted hover:text-eclipse-text-light dark:hover:text-space-text transition-colors"
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
    </nav>
  );
};

export default Navbar;
