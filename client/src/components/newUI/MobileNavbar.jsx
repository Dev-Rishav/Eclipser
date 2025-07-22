// src/components/MobileNavbar.js

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"

// Replace these with your actual file imports
import { logoutUser } from "../../Redux/actions/authActions";
import ThemeSwitcher from "../ThemeSwitcher";
import useDebounce from "../../hooks/useDebounce";
import { API_ENDPOINTS } from "../../config/api";
import { useNotificationsRedux } from "../../hooks/useNotificationsRedux";
// You would also import your other hooks here (useNotificationsRedux)

const MobileNavbar = () => {
    // --- Core State ---
    const { isAuthenticated } = useSelector((state) => state.auth) || {};
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeOverlay, setActiveOverlay] = useState(null); // 'menu', 'search', 'notifications'
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- Search State & Logic ---
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
    const [isSearching, setIsSearching] = useState(false);
    
    // --- Notifications State & Logic ---
    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
    } = useNotificationsRedux();

    // --- Effects ---
    useEffect(() => {
        // Lock body scroll when any overlay is open
        if (activeOverlay) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeOverlay]);

    useEffect(() => {
        if (debouncedSearchQuery) {
            setIsSearching(true);
            // Mock API call
            setTimeout(() => {
                setSearchResults({
                    users: [{ id: 1, username: 'nova_rider', avatar: '' }],
                    posts: [{ id: 1, title: 'Exploring the Andromeda Galaxy', authorName: 'nova_rider' }]
                });
                setIsSearching(false);
            }, 1000);
        } else {
            setSearchResults({ users: [], posts: [] });
        }
    }, [debouncedSearchQuery]);

    // --- Handlers ---
    const handleLogout = useCallback(() => {
        dispatch(logoutUser());
        navigate("/login", { replace: true });
    }, [dispatch, navigate]);

    const confirmLogout = () => {
        setShowLogoutModal(false);
        handleLogout();
    };

    const navigateAndClose = (path) => {
        setActiveOverlay(null);
        navigate(path);
    };
    
    const handleNotificationClickWithMarkRead = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id || notification._id);
        }
        handleNotificationClick(notification);
        setActiveOverlay(null);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const overlayVariants = {
        hidden: { opacity: 0, transition: { duration: 0.3 } },
        visible: { opacity: 1, transition: { duration: 0.3 } },
    };

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <div className="h-20 flex items-center justify-between px-4 w-full text-gray-800 dark:text-space-text">
        <NavLink to="/">
          <motion.span className="text-xl font-mono font-bold bg-gradient-to-r from-stellar-blue to-stellar-purple bg-clip-text text-transparent uppercase tracking-wider" whileHover={{ letterSpacing: "0.1em" }}>
            ECLIPSER
          </motion.span>
        </NavLink>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <motion.button onClick={() => setActiveOverlay('search')} className="relative p-2" whileTap={{ scale: 0.9 }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </motion.button>
          {isAuthenticated && (
            <motion.button onClick={() => setActiveOverlay('notifications')} className="relative p-2" whileTap={{ scale: 0.9 }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" /><path d="M11 19H6.5a2.5 2.5 0 010-5H9m-4-4h11a2 2 0 012 2v2a2 2 0 01-2 2H9" /></svg>
              {unreadCount > 0 && (
                <motion.span className="absolute -top-0 -right-0 w-4 h-4 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full font-mono" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          )}
          <motion.button onClick={() => setActiveOverlay('menu')} className="relative p-2" whileTap={{ scale: 0.9 }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {/* --- MENU OVERLAY --- */}
        {activeOverlay === 'menu' && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} className="fixed inset-0 h-screen w-screen bg-white/95 dark:bg-space-darker/95 backdrop-blur-lg z-[100] flex flex-col">
            <div className="h-20 flex items-center justify-between px-4 flex-shrink-0">
                <span className="text-xl font-mono font-bold bg-gradient-to-r from-stellar-blue to-stellar-purple bg-clip-text text-transparent uppercase">MENU</span>
                <motion.button onClick={() => setActiveOverlay(null)} className="p-2 text-gray-800 dark:text-space-text" whileTap={{ scale: 0.9 }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </motion.button>
            </div>
            <div className="flex-grow overflow-y-auto"><nav className="py-8"><ul className="flex flex-col items-center space-y-8">
                <li><button onClick={() => navigateAndClose('/')} className="font-mono text-2xl uppercase tracking-widest text-gray-800 dark:text-gray-200 hover:text-stellar-blue">HOME</button></li>
                <li><button onClick={() => navigateAndClose('/topics')} className="font-mono text-2xl uppercase tracking-widest text-gray-800 dark:text-gray-200 hover:text-stellar-purple">TOPICS</button></li>
                {/* ... other links */}
            </ul></nav></div>
            <div className="flex flex-col items-center space-y-6 p-8 flex-shrink-0"><ThemeSwitcher />
              {isAuthenticated ? (
                <motion.button onClick={() => { setActiveOverlay(null); setShowLogoutModal(true); }} className="w-full max-w-xs px-4 py-3 text-lg bg-gradient-to-r from-stellar-orange/20 to-red-500/20 text-stellar-orange border border-stellar-orange/30 rounded-lg font-mono uppercase tracking-wide">LOGOUT</motion.button>
              ) : (
                <div className="flex flex-col space-y-4 w-full max-w-xs">
                  <button onClick={() => navigateAndClose('/login')} className="px-4 py-3 text-lg border border-stellar-blue/30 rounded-lg font-mono uppercase tracking-wide text-gray-800 dark:text-gray-200">LOGIN</button>
                  <button onClick={() => navigateAndClose('/signup')} className="bg-gradient-to-r from-stellar-blue to-stellar-purple text-white px-4 py-3 rounded-lg text-lg font-mono uppercase tracking-wide shadow-lg">SIGN UP</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- SEARCH OVERLAY --- */}
        {activeOverlay === 'search' && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} className="fixed inset-0 h-screen w-screen bg-white/95 dark:bg-space-darker/95 backdrop-blur-lg z-[100] flex flex-col">
            <div className="h-20 flex items-center justify-between px-4 flex-shrink-0">
                <input type="text" placeholder="SEARCH ECLIPSER..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="w-full bg-transparent text-xl font-mono uppercase text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none"/>
                <motion.button onClick={() => setActiveOverlay(null)} className="p-2 text-gray-800 dark:text-space-text" whileTap={{ scale: 0.9 }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </motion.button>
            </div>
            <div className="flex-grow overflow-y-auto px-4 pb-4">
              {isSearching ? <div className="p-4 text-center font-mono text-sm text-stellar-blue">Searching...</div>
              : !debouncedSearchQuery ? <div className="p-4 text-center font-mono text-sm text-gray-500">Start typing to search for users or posts.</div>
              : (searchResults.users.length === 0 && searchResults.posts.length === 0) ? <div className="p-4 text-center font-mono text-sm text-stellar-orange">No results found.</div>
              : (
                <div className="space-y-4">
                  {searchResults.users.length > 0 && (<div><h4 className="px-2 py-2 text-xs font-bold text-stellar-purple uppercase tracking-widest font-mono">Users</h4>{searchResults.users.map(user => (<div key={user.id} className="p-3 text-gray-800 dark:text-white hover:bg-stellar-blue/10 rounded-lg">{user.username}</div>))}</div>)}
                  {searchResults.posts.length > 0 && (<div><h4 className="px-2 py-2 text-xs font-bold text-stellar-green uppercase tracking-widest font-mono">Posts</h4>{searchResults.posts.map(post => (<div key={post.id} className="p-3 text-gray-800 dark:text-white hover:bg-stellar-green/10 rounded-lg">{post.title}</div>))}</div>)}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- NOTIFICATIONS OVERLAY --- */}
        {activeOverlay === 'notifications' && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} className="fixed inset-0 h-screen w-screen bg-white/95 dark:bg-space-darker/95 backdrop-blur-lg z-[100] flex flex-col">
            <div className="h-20 flex items-center justify-between px-4 flex-shrink-0 border-b border-stellar-blue/20">
                <span className="text-xl font-mono font-bold text-stellar-blue uppercase">COMMS CENTER</span>
                <motion.button onClick={() => setActiveOverlay(null)} className="p-2 text-gray-800 dark:text-space-text" whileTap={{ scale: 0.9 }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </motion.button>
            </div>
            <div className="flex-grow overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div key={notification.id || notification._id} whileHover={{backgroundColor: "rgba(59, 130, 246, 0.05)"}} className={`p-4 border-b border-stellar-blue/10 ${!notification.read ? "border-l-4 border-l-stellar-blue" : ""}`} onClick={() => handleNotificationClickWithMarkRead(notification)}>
                    <div className="flex items-start space-x-3"><div className="text-lg">{notification.icon}</div>
                      <div className="flex-1 min-w-0"><h4 className="text-sm font-medium text-gray-900 dark:text-space-text font-mono uppercase">{notification.title}</h4><p className="text-xs text-gray-600 dark:text-space-muted mt-1">{notification.message}</p></div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center"><p className="text-sm text-gray-500 dark:text-space-muted font-mono">NO INCOMING TRANSMISSIONS</p></div>
              )}
            </div>
            {notifications.length > 0 && (<div className="p-4 flex-shrink-0 border-t border-stellar-blue/20"><button onClick={handleMarkAllAsRead} className="w-full text-center text-sm text-stellar-blue hover:text-stellar-blue/80 font-mono uppercase">MARK ALL AS READ</button></div>)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LOGOUT MODAL --- */}
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
    </>
  );
};

export default MobileNavbar;
