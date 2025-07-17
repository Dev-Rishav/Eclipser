import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";

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
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 backdrop-blur-lg bg-white/90">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className="text-2xl font-bold text-gray-900"
            >
              ECLIPSER
            </NavLink>

            <div className="hidden md:flex space-x-6">
              <NavLink
                to="/topics"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-blue-600" : "text-gray-600"
                  } hover:text-blue-600 transition-colors`
                }
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Topics
              </NavLink>
              <NavLink
                to="/contest"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-blue-600" : "text-gray-600"
                  } hover:text-blue-600 transition-colors`
                }
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
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
                className="w-48 pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-gray-400"></div>
            </div>

            {isAuthenticated ? (
              <>
                <button className="relative text-gray-600 hover:text-blue-600 transition-colors">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                    3
                  </span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white cursor-pointer"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                      alt="Profile"
                    >
                      {user?.username[0].toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
                  </div>

                  <div className="flex flex-col cursor-pointer">
                    <span
                      className="text-sm text-gray-900 font-medium"
                      onClick={() => navigate("/profile", {
                        state: { userId: user._id }
                      })}
                    >
                      {user?.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.role || "Member"}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
