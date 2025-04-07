import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false); // State to control the modal visibility

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const confirmLogout = () => {
    setShowLogoutModal(false); // Close the modal
    handleLogout(); // Perform logout
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-cosmic to-stellar border-b border-nebula border-opacity-30 backdrop-filter backdrop-blur-lg">
      <div className="w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className="text-2xl font-orbitron text-corona font-bold"
            >
              ECLIPSER
            </NavLink>

            <div className="hidden md:flex space-x-6">
              <NavLink
                to="/topics"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-corona" : "text-stardust"
                  } hover:text-corona`
                }
              >
                <span className="w-2 h-2 rounded-full bg-nebula bg-opacity-70 mr-2"></span>
                Topics
              </NavLink>
              <NavLink
                to="/contests"
                className={({ isActive }) =>
                  `flex items-center ${
                    isActive ? "text-corona" : "text-stardust"
                  } hover:text-corona`
                }
              >
                <span className="w-2 h-2 rounded-full bg-nebula bg-opacity-70 mr-2"></span>
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
                className="w-48 pl-8 pr-4 py-2 bg-white bg-opacity-10 border border-nebula border-opacity-30 rounded-full text-stardust placeholder-stardust placeholder-opacity-50 focus:w-64 transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-nebula bg-opacity-70"></div>
            </div>

            {isAuthenticated ? (
              <>
                <button className="relative text-stardust hover:text-corona">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-supernova text-cosmic rounded-full">
                    3
                  </span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-nebula to-supernova font-bold text-cosmic cursor-pointer"
                      onClick={() => navigate("/profile")}
                    >
                      {user?.username[0].toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400"></div>
                  </div>

                  <div className="flex flex-col cursor-pointer">
                    <span
                      className="text-sm text-stardust"
                      onClick={() => navigate("/profile")}
                    >
                      {user?.username}
                    </span>
                    <button
                      onClick={() => setShowLogoutModal(true)} // Open the modal
                      className="text-xs text-supernova hover:underline"
                    >
                      Exit Airlock
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-gradient-to-br from-nebula to-supernova text-cosmic rounded-full hover:transform hover:-translate-y-px"
              >
                Board Station
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-stellar to-cosmic p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl text-corona font-bold mb-4">
              Confirm Logout
            </h2>
            <p className="text-stardust mb-6">
              Are you sure you want to exit the airlock?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-supernova text-cosmic rounded-lg hover:brightness-110"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)} // Close the modal
                className="px-4 py-2 bg-nebula text-cosmic rounded-lg hover:brightness-110"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;