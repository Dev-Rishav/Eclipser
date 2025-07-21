import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions/authActions";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "../ThemeSwitcher";
import { useNotificationsRedux } from "../../hooks/useNotificationsRedux";
import useDebounce from "../../hooks/useDebounce";
import { API_ENDPOINTS } from "../../config/api";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContestDropdown, setShowContestDropdown] = useState(false);
  const notificationRef = useRef(null);
  const contestRef = useRef(null);

  // --- State for Search Functionality ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null); // Ref for the search container
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search query by 500ms

  const {
    notifications: realNotifications,
    unreadCount: realUnreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
  } = useNotificationsRedux();

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    localStorage.clear();
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  // --- Updated useEffect for clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (contestRef.current && !contestRef.current.contains(event.target)) {
        setShowContestDropdown(false);
      }
      // Close search results on outside click
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- useEffect for Fetching Search Results ---
  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearching(true);
      setShowResults(true);

      const controller = new AbortController();
      const signal = controller.signal;

      fetch(API_ENDPOINTS.SEARCH.Search_Users_And_Posts(debouncedSearchQuery), {
        signal,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setSearchResults(data);
          setIsSearching(false);
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.log("Fetch aborted");
          } else {
            console.error("Search API error:", err);
            setIsSearching(false);
          }
        });

      return () => {
        controller.abort();
      };
    } else {
      setShowResults(false);
      setSearchResults({ users: [], posts: [] });
    }
  }, [debouncedSearchQuery]);

  const notifications = realNotifications;
  const unreadCount = realUnreadCount;

  const handleNotificationClickWithMarkRead = async (notification) => {
    if (!notification.read) {
      try {
        const notificationId = notification.id || notification._id;
        await markAsRead(notificationId);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    handleNotificationClick(notification);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <>
      {/* Cockpit Status Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-stellar-blue via-stellar-purple to-stellar-orange"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-full w-20 bg-white/30 blur-sm"
        />
      </motion.div>

      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-1 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 border-b border-stellar-blue/20 bg-gradient-to-r from-eclipse-surface/95 via-eclipse-border/95 to-eclipse-surface/95 dark:from-space-darker/95 dark:via-space-dark/95 dark:to-space-darker/95 backdrop-blur-lg text-eclipse-text-light dark:text-space-text shadow-lg"
      >
        <div className="flex items-center">
          <div className="mr-6">
            <NavLink to="/" className="flex items-center group">
              <motion.div
                className="relative w-10 h-10 bg-gradient-to-br from-stellar-blue to-stellar-purple rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <motion.span
                className="ml-3 text-xl font-mono font-bold bg-gradient-to-r from-stellar-blue to-stellar-purple bg-clip-text text-transparent uppercase tracking-wider"
                whileHover={{ letterSpacing: "0.15em" }}
                transition={{ duration: 0.2 }}
              >
                ECLIPSER
              </motion.span>
            </NavLink>
          </div>

          <ul className="flex space-x-8 font-mono">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative border-b-2 pb-1 transition-all uppercase tracking-wide text-sm ${
                    isActive
                      ? "border-stellar-blue text-stellar-blue shadow-stellar-blue-glow"
                      : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-blue hover:text-stellar-blue"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>HOME</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stellar-blue rounded-full shadow-stellar-blue-glow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/topics"
                className={({ isActive }) =>
                  `relative border-b-2 pb-1 transition-all uppercase tracking-wide text-sm ${
                    isActive
                      ? "border-stellar-purple text-stellar-purple shadow-stellar-purple-glow"
                      : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-purple hover:text-stellar-purple"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>TOPICS</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stellar-purple rounded-full shadow-stellar-purple-glow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li className="relative" ref={contestRef}>
              <motion.button
                onClick={() => setShowContestDropdown(!showContestDropdown)}
                className={`flex items-center border-b-2 pb-1 transition-all uppercase tracking-wide text-sm font-mono ${
                  showContestDropdown
                    ? "border-stellar-orange text-stellar-orange shadow-stellar-orange-glow"
                    : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-orange hover:text-stellar-orange"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <span>CONTESTS</span>
                <motion.div
                  animate={{ rotate: showContestDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="ml-2"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {showContestDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-gradient-to-br from-eclipse-surface/95 to-eclipse-border/95 dark:from-space-darker/95 dark:to-space-dark/95 border border-stellar-orange/30 rounded-lg shadow-2xl z-[60] overflow-hidden backdrop-blur-lg"
                  >
                    <div className="py-2">
                      <NavLink
                        to="/contest"
                        className="flex items-center px-4 py-3 text-sm font-mono uppercase tracking-wide text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-orange hover:bg-stellar-orange/10 transition-all border-l-2 border-transparent hover:border-stellar-orange"
                        onClick={() => setShowContestDropdown(false)}
                      >
                        <span className="mr-3 text-stellar-orange">🏆</span>
                        ACTIVE
                      </NavLink>
                      <NavLink
                        to="/contest/upcoming"
                        className="flex items-center px-4 py-3 text-sm font-mono uppercase tracking-wide text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-blue hover:bg-stellar-blue/10 transition-all border-l-2 border-transparent hover:border-stellar-blue"
                        onClick={() => setShowContestDropdown(false)}
                      >
                        <span className="mr-3 text-stellar-blue">⏰</span>
                        UPCOMING
                      </NavLink>
                      <NavLink
                        to="/contest/results"
                        className="flex items-center px-4 py-3 text-sm font-mono uppercase tracking-wide text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-purple hover:bg-stellar-purple/10 transition-all border-l-2 border-transparent hover:border-stellar-purple"
                        onClick={() => setShowContestDropdown(false)}
                      >
                        <span className="mr-3 text-stellar-purple">📊</span>
                        RESULTS
                      </NavLink>
                      <NavLink
                        to="/contest/practice"
                        className="flex items-center px-4 py-3 text-sm font-mono uppercase tracking-wide text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-green hover:bg-stellar-green/10 transition-all border-l-2 border-transparent hover:border-stellar-green"
                        onClick={() => setShowContestDropdown(false)}
                      >
                        <span className="mr-3 text-stellar-green">💪</span>
                        PRACTICE
                      </NavLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li>
              <NavLink
                to="/communications"
                className={({ isActive }) =>
                  `relative border-b-2 pb-1 transition-all uppercase tracking-wide text-sm ${
                    isActive
                      ? "border-stellar-green text-stellar-green shadow-stellar-green-glow"
                      : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-green hover:text-stellar-green"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>COMMS</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stellar-green rounded-full shadow-stellar-green-glow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/help"
                className={({ isActive }) =>
                  `relative border-b-2 pb-1 transition-all uppercase tracking-wide text-sm ${
                    isActive
                      ? "border-stellar-orange text-stellar-orange shadow-stellar-orange-glow"
                      : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-orange hover:text-stellar-orange"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>SUPPORT</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stellar-orange rounded-full shadow-stellar-orange-glow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `relative border-b-2 pb-1 transition-all uppercase tracking-wide text-sm ${
                    isActive
                      ? "border-stellar-purple text-stellar-purple shadow-stellar-purple-glow"
                      : "border-transparent text-eclipse-text-light/80 dark:text-space-text/80 hover:border-stellar-purple hover:text-stellar-purple"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>RANKS</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stellar-purple rounded-full shadow-stellar-purple-glow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-4">
          {/* --- Updated Cockpit Search with Results Dropdown --- */}
          <motion.div
            className="relative"
            ref={searchRef} // Attach ref to the search container
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-48 pl-9 pr-4 py-2 
                         bg-eclipse-surface/90 dark:bg-space-darker/90 
                         border border-stellar-blue/30 
                         hover:border-stellar-blue/50 
                         focus:border-stellar-blue 
                         rounded-lg 
                         text-eclipse-text-light dark:text-space-text 
                         placeholder-eclipse-muted-light/60 dark:placeholder-space-muted/60 
                         focus:w-56 focus:outline-none 
                         focus:ring-1 focus:ring-stellar-blue/40 
                         transition-all duration-300
                         font-mono text-sm uppercase tracking-wide 
                         backdrop-blur-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-stellar-blue/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <AnimatePresence>
              {showResults && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-gradient-to-br from-eclipse-surface/95 to-eclipse-border/95 dark:from-space-darker/95 dark:to-space-dark/95 border border-stellar-blue/30 rounded-lg shadow-2xl z-[60] overflow-hidden backdrop-blur-lg"
                >
                  {isSearching ? (
                    <div className="p-4 text-center font-mono text-sm uppercase tracking-wider text-stellar-blue">
                      Searching...
                    </div>
                  ) : searchResults.users.length > 0 ||
                    searchResults.posts.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto notification-scroll">
                      {searchResults.users.length > 0 && (
                        <div>
                          <h4 className="px-4 py-2 text-xs font-bold text-stellar-purple uppercase tracking-widest font-mono bg-stellar-purple/10">
                            Users
                          </h4>
                          {searchResults.users.map((user) => (
                            <NavLink
                              to={`/user/${user.username}`}
                              key={user.id}
                              className="block hover:bg-stellar-blue/10"
                              onClick={() => setShowResults(false)}
                            >
                              <div className="flex items-center px-4 py-3 space-x-3">
                                {/* <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-stellar-blue/20 flex-shrink-0" /> */}

                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  // ✨ Otherwise, show a div with the first initial
                                  <div className="w-8 h-8 rounded-full bg-stellar-blue/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-stellar-blue uppercase">
                                      {user.username && user.username.charAt(0)}
                                    </span>
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-sm text-eclipse-text-light dark:text-space-text truncate">
                                    {user.username}
                                  </p>
                                </div>
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      )}
                      {searchResults.posts.length > 0 && (
                        <div>
                          <h4 className="px-4 py-2 text-xs font-bold text-stellar-green uppercase tracking-widest font-mono bg-stellar-green/10">
                            Posts
                          </h4>
                          {searchResults.posts.map((post) => (
                            <NavLink
                              to={`/post/${post.id}`}
                              key={post.id}
                              className="block hover:bg-stellar-green/10"
                              onClick={() => setShowResults(false)}
                            >
                              <div className="flex items-center px-4 py-3 space-x-3">
                                <div className="flex-shrink-0 text-stellar-green/80">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-sm truncate text-eclipse-text-light dark:text-space-text">
                                    {post.title}
                                  </p>
                                  <p className="font-mono text-xs truncate text-eclipse-muted-light dark:text-space-muted">
                                    by {post.authorName}
                                  </p>
                                </div>
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center font-mono text-sm uppercase tracking-wider text-stellar-orange">
                      No results found.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {isAuthenticated ? (
            <>
              <div className="relative" ref={notificationRef}>
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-eclipse-muted-light/60 dark:text-space-text/60 hover:text-stellar-blue transition-colors p-2 rounded-lg hover:bg-stellar-blue/10 border border-stellar-blue/20 bg-gradient-to-br from-eclipse-surface/50 to-eclipse-border/50 dark:from-space-darker/50 dark:to-space-dark/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={unreadCount > 0 ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{
                      duration: 2,
                      repeat: unreadCount > 0 ? Infinity : 0,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19H6.5a2.5 2.5 0 010-5H9m-4-4h11a2 2 0 012 2v2a2 2 0 01-2 2H9"
                    />
                  </motion.svg>

                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full shadow-stellar-orange-glow font-mono"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}

                  <motion.div
                    className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full ${
                      isConnected
                        ? "bg-stellar-green shadow-stellar-green-glow"
                        : "bg-red-500 shadow-red-500-glow"
                    }`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-gradient-to-br from-eclipse-surface/95 to-eclipse-border/95 dark:from-space-darker/95 dark:to-space-dark/95 border border-stellar-blue/30 rounded-lg shadow-2xl z-[60] overflow-hidden backdrop-blur-lg"
                    >
                      <div className="px-4 py-3 border-b border-stellar-blue/20 bg-gradient-to-r from-stellar-blue/10 to-stellar-purple/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 bg-stellar-blue rounded-full shadow-stellar-blue-glow"
                            />
                            <h3 className="text-sm font-bold text-stellar-blue uppercase tracking-wider font-mono">
                              COMMS CENTER
                            </h3>
                            {!isConnected && (
                              <span className="text-xs text-stellar-orange font-mono uppercase">
                                [OFFLINE]
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                              <span className="text-xs text-stellar-purple font-mono">
                                {unreadCount} NEW
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <motion.button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-stellar-blue hover:text-stellar-blue/80 transition-colors font-mono uppercase tracking-wide"
                                whileHover={{ scale: 1.05 }}
                              >
                                CLEAR ALL
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto notification-scroll">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id || notification._id}
                              whileHover={{
                                backgroundColor: "rgba(59, 130, 246, 0.05)",
                                x: 2,
                              }}
                              className={`px-4 py-3 border-b border-stellar-blue/10 cursor-pointer transition-all group ${
                                !notification.read
                                  ? "bg-stellar-blue/5 border-l-2 border-l-stellar-blue"
                                  : "border-l-2 border-l-transparent"
                              }`}
                              onClick={() =>
                                handleNotificationClickWithMarkRead(
                                  notification
                                )
                              }
                            >
                              <div className="flex items-start space-x-3">
                                <motion.div
                                  className="flex-shrink-0 text-lg"
                                  animate={
                                    !notification.read
                                      ? { scale: [1, 1.1, 1] }
                                      : {}
                                  }
                                  transition={{
                                    duration: 2,
                                    repeat: !notification.read ? Infinity : 0,
                                  }}
                                >
                                  {notification.icon}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-eclipse-text-light dark:text-space-text truncate font-mono uppercase tracking-wide">
                                      {notification.title}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      {!notification.read && (
                                        <motion.div
                                          className="w-2 h-2 bg-stellar-blue rounded-full flex-shrink-0 shadow-stellar-blue-glow"
                                          animate={{ scale: [0.8, 1.2, 0.8] }}
                                          transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                          }}
                                        />
                                      )}
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const notificationId =
                                            notification.id || notification._id;
                                          deleteNotification(notificationId);
                                        }}
                                        className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-orange transition-colors text-xs opacity-0 group-hover:opacity-100 font-mono"
                                        whileHover={{ scale: 1.2 }}
                                      >
                                        ✕
                                      </motion.button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-eclipse-muted-light dark:text-space-muted mt-1 line-clamp-2 font-mono">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-stellar-blue/60 mt-2 font-mono uppercase">
                                    {notification.time ||
                                      new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <motion.div
                              className="text-4xl mb-2"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              📡
                            </motion.div>
                            <p className="text-sm text-eclipse-muted-light dark:text-space-muted font-mono uppercase tracking-wide">
                              NO INCOMING TRANSMISSIONS
                            </p>
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-stellar-blue/20 bg-gradient-to-r from-stellar-blue/5 to-stellar-purple/5">
                          <div className="flex justify-between items-center">
                            <motion.button
                              className="text-sm text-stellar-blue hover:text-stellar-blue/80 transition-colors font-mono uppercase tracking-wide"
                              whileHover={{ scale: 1.05 }}
                            >
                              VIEW ALL COMMS
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-1 rounded-lg border border-stellar-purple/30 bg-gradient-to-br from-eclipse-surface/50 to-eclipse-border/50 dark:from-space-darker/50 dark:to-space-dark/50"
              >
                <ThemeSwitcher />
              </motion.div>

              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-stellar-orange/20 to-red-500/20 hover:from-stellar-orange/30 hover:to-red-500/30 text-stellar-orange border border-stellar-orange/30 hover:border-stellar-orange/50 rounded-lg transition-all font-mono uppercase tracking-wide shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  LOGOUT
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-1 rounded-lg border border-stellar-purple/30 bg-gradient-to-br from-eclipse-surface/50 to-eclipse-border/50 dark:from-space-darker/50 dark:to-space-dark/50"
                >
                  <ThemeSwitcher />
                </motion.div>

                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm text-eclipse-text-light/80 dark:text-space-text/80 hover:text-stellar-blue transition-colors font-mono uppercase tracking-wide"
                >
                  LOGIN
                </NavLink>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NavLink
                    to="/signup"
                    className="bg-gradient-to-r from-stellar-blue to-stellar-purple hover:from-stellar-blue/80 hover:to-stellar-purple/80 text-white px-4 py-2 rounded-lg transition-all font-mono uppercase tracking-wide shadow-lg"
                  >
                    SIGN UP
                  </NavLink>
                </motion.button>
              </div>
            </>
          )}
        </div>

        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-space-void/90 backdrop-blur-sm flex items-center justify-center z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-eclipse-surface/95 to-eclipse-border/95 dark:from-space-darker/95 dark:to-space-dark/95 border border-stellar-orange/30 rounded-lg p-6 max-w-sm mx-4 shadow-2xl backdrop-blur-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-2xl"
                >
                  ⚠️
                </motion.div>
                <h3 className="text-lg font-bold text-stellar-orange uppercase tracking-wide font-mono">
                  CONFIRM LOGOUT
                </h3>
              </div>
              <p className="text-eclipse-muted-light dark:text-space-muted mb-6 font-mono text-sm">
                ARE YOU SURE YOU WANT TO TERMINATE THIS SESSION?
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-sm text-eclipse-text-light dark:text-space-text hover:text-stellar-blue transition-colors border border-stellar-blue/30 hover:border-stellar-blue/50 rounded-lg font-mono uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                >
                  CANCEL
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-stellar-orange to-red-500 hover:from-stellar-orange/80 hover:to-red-500/80 text-white rounded-lg transition-all font-mono uppercase tracking-wide shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)",
                  }}
                >
                  LOGOUT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
};

export default Navbar;
