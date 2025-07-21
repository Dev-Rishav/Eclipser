/**
 * Communications Page - Aerospace Mission Control Chat Interface
 * Enhanced with followers/following functionality and real-time messaging
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaRocket, 
  FaPaperPlane, 
  FaUsers, 
  FaSearch, 
  FaCircle,
  FaMicrophone,
  FaVideo,
  FaPhone,
  FaEllipsisV,
  FaArrowLeft,
  FaUserFriends,
  FaHeart,
  FaClock
} from 'react-icons/fa';
import socket from '../config/socket';
import axiosInstance from '../config/axiosConfig';
import { API_ENDPOINTS, apiLog, apiError } from '../config/api';

const Communications = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // Enhanced state for followers/following
  const [activeTab, setActiveTab] = useState('recent'); // recent, followers, following, all
  const [recentChats, setRecentChats] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({
    followers: 0,
    following: 0,
    recent: 0
  });
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket event handlers
  const handleNewMessage = useCallback((message) => {
    apiLog('📨 Incoming transmission:', message);
    
    if (selectedChat && 
        (message.sender === selectedChat._id || message.receiver === selectedChat._id)) {
      setMessages(prev => [...prev, message]);
    }
    
    // Update recent chats
    loadRecentChats();
    
    // Show notification if not in active chat
    if (!selectedChat || message.sender !== selectedChat._id) {
      toast.success(`New message from ${message.senderName || 'Unknown'}`);
    }
  }, [selectedChat]);

  const handleUserOnline = useCallback((userId) => {
    setOnlineUsers(prev => new Set([...prev, userId]));
    apiLog('🟢 User online:', userId);
  }, []);

  const handleUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    apiLog('⚫ User offline:', userId);
  }, []);

  const handleTypingStart = useCallback((data) => {
    if (selectedChat && data.userId === selectedChat._id) {
      setTypingUsers(prev => new Set([...prev, data.username]));
    }
  }, [selectedChat]);

  const handleTypingStop = useCallback((data) => {
    if (selectedChat && data.userId === selectedChat._id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.username);
        return newSet;
      });
    }
  }, [selectedChat]);

  const handleOnlineUsers = useCallback((users) => {
    setOnlineUsers(new Set(users));
    apiLog('👥 Online users updated:', users.length);
  }, []);

  // Socket initialization and cleanup
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit('register', user._id);
    
    // Socket event listeners
    socket.on('private_message', handleNewMessage);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('typing', handleTypingStart);
    socket.on('stop_typing', handleTypingStop);
    socket.on('online_users', handleOnlineUsers);

    apiLog('🚀 Communications system online - User registered:', user._id);

    return () => {
      socket.off('private_message', handleNewMessage);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('typing', handleTypingStart);
      socket.off('stop_typing', handleTypingStop);
      socket.off('online_users', handleOnlineUsers);
      socket.disconnect();
      apiLog('📡 Communications system offline');
    };
  }, [user?._id, handleNewMessage, handleUserOnline, handleUserOffline, handleTypingStart, handleTypingStop, handleOnlineUsers]);

  // Data loading functions
  const loadRecentChats = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.RECENT_CHATS);
      
      if (response.data?.chats) {
        const chatsWithUserInfo = await Promise.all(
          response.data.chats.map(async (chat) => {
            try {
              const userResponse = await axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(chat.otherUser));
              return {
                ...chat,
                user: userResponse.data.user,
                _id: chat.otherUser
              };
            } catch (error) {
              apiError('Failed to load user info for chat:', error);
              return {
                ...chat,
                user: { username: 'Unknown User', profilePic: null },
                _id: chat.otherUser
              };
            }
          })
        );
        
        setRecentChats(chatsWithUserInfo);
        setUserCounts(prev => ({ ...prev, recent: chatsWithUserInfo.length }));
      }
    } catch (error) {
      apiError('Failed to load recent chats:', error);
      toast.error('Failed to load recent communications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.FOLLOWERS(user._id));
      
      const followers = response.data?.followers || [];
      setFollowers(followers);
      setUserCounts(prev => ({ ...prev, followers: followers.length }));
      
      apiLog('👥 Followers loaded:', followers.length);
    } catch (error) {
      apiError('Failed to load followers:', error);
      toast.error('Failed to load followers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.FOLLOWING(user._id));
      
      const following = response.data?.following || [];
      setFollowing(following);
      setUserCounts(prev => ({ ...prev, following: following.length }));
      
      apiLog('👥 Following loaded:', following.length);
    } catch (error) {
      apiError('Failed to load following:', error);
      toast.error('Failed to load following');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
      const users = (response.data?.users || []).filter(u => u._id !== user._id);
      setAllUsers(users);
      apiLog('👥 All users loaded:', users.length);
    } catch (error) {
      apiError('Failed to load users:', error);
      toast.error('Failed to load user directory');
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${API_ENDPOINTS.USERS.BASE}?search=${encodeURIComponent(query)}`);
      const users = (response.data?.users || []).filter(u => u._id !== user._id);
      setAllUsers(users);
    } catch (error) {
      apiError('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for selected chat
  const loadMessages = async (chatUser) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.BY_USER(chatUser._id));
      setMessages(response.data?.messages || []);
      setSelectedChat(chatUser);
      
      // Scroll to bottom after messages are loaded and DOM is updated
      setTimeout(() => {
        scrollToBottom(true); // Force scroll for initial load
        setIsUserScrolling(false); // Reset user scrolling state
      }, 200);
      
      apiLog('📨 Messages loaded for:', chatUser.username);
    } catch (error) {
      apiError('Failed to load messages:', error);
      toast.error('Failed to load message history');
      setMessages([]);
      setSelectedChat(chatUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      sender: user._id,
      receiver: selectedChat._id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderName: user.username
    };

    try {
      // Send via socket for real-time delivery
      socket.emit('private_message', messageData);
      
      if(socket.connected) {
      // Send via API for persistence
      await axiosInstance.post(API_ENDPOINTS.MESSAGES.CREATE, messageData);
      }
      
      // Add to local messages immediately for better UX
      setMessages(prev => [...prev, { ...messageData, sender: user._id }]);
      setNewMessage('');
      
      apiLog('📤 Message sent:', messageData);
      
      // Stop typing
      handleStopTyping();
      
    } catch (error) {
      apiError('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  // Typing handlers
  const handleStartTyping = () => {
    if (!selectedChat || isTyping) return;
    
    setIsTyping(true);
    socket.emit('typing', {
      userId: user._id,
      username: user.username,
      targetUserId: selectedChat._id
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(handleStopTyping, 3000);
  };

  const handleStopTyping = () => {
    if (!isTyping || !selectedChat) return;
    
    setIsTyping(false);
    socket.emit('stop_typing', {
      userId: user._id,
      targetUserId: selectedChat._id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user?._id) {
      loadRecentChats();
      loadFollowers();
      loadFollowing();
    }
  }, [user?._id]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      loadAllUsers();
    }
  }, [activeTab]);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && activeTab === 'all') {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Enhanced scroll management
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback((force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      if (force || !isUserScrolling) {
        container.scrollTop = container.scrollHeight;
        setShowScrollButton(false);
      }
    }
  }, [isUserScrolling]);

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isNearBottom && messages.length > 0);
      setIsUserScrolling(!isNearBottom);
    }
  }, [messages.length]);

  // Auto scroll to bottom - intelligent scrolling for new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (selectedChat) {
          const container = messagesContainerRef.current;
          if (container) {
            const isAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
            // Only auto-scroll if user is near bottom or it's the first message load
            if (isAtBottom || !isUserScrolling) {
              scrollToBottom();
            }
          }
        }
      }, 100);
    }
  }, [messages, scrollToBottom, selectedChat, isUserScrolling]);

  // Get current user list based on active tab
  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'recent':
        return recentChats;
      case 'followers':
        return followers;
      case 'following':
        return following;
      case 'all':
        return allUsers;
      default:
        return recentChats;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-space-void flex items-center justify-center">
        <div className="text-space-text">
          <FaRocket className="w-8 h-8 animate-bounce mx-auto mb-4" />
          <p>Initializing Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-void via-space-dark to-space-darker pb-16">
      {/* Mission Control Header */}
      <div className="sticky top-20 z-40 bg-gradient-to-r from-space-darker/95 to-space-dark/95 backdrop-blur-lg border-b border-stellar-blue/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-stellar-blue/20 to-stellar-purple/20 rounded-xl">
                <FaRocket className="w-6 h-6 text-stellar-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold text-white tracking-wider">
                  MISSION CONTROL
                </h1>
                <p className="text-sm text-space-muted font-mono">
                  Secure Communications Network
                </p>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaCircle className={`w-2 h-2 ${socket.connected ? 'text-stellar-green' : 'text-stellar-red'}`} />
                <span className="text-sm font-mono text-space-text">
                  {socket.connected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="text-sm font-mono text-space-muted">
                {onlineUsers.size} ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Height Chat Container - Absolutely Fixed */}
      <div className="container mx-auto px-4 py-6">
        <div 
          className="flex flex-col lg:flex-row gap-6" 
          style={{ 
            height: 'calc(100vh - 260px)', 
            maxHeight: 'calc(100vh - 260px)',
            overflow: 'hidden'
          }}
        >
          
          {/* Chat Sidebar */}
          <div 
            className="w-full lg:w-1/3 bg-gradient-to-b from-space-darker/80 to-space-dark/80 rounded-2xl border border-stellar-blue/30 flex flex-col overflow-hidden"
            style={{ height: '100%', maxHeight: '100%' }}
          >
            
            {/* Tab Navigation */}
            <div className="flex-shrink-0 p-4 border-b border-stellar-blue/20">
              <div className="grid grid-cols-4 gap-1 bg-space-void/50 rounded-xl p-1">
                {[
                  { key: 'recent', icon: FaClock, label: 'Recent', count: userCounts.recent },
                  { key: 'followers', icon: FaHeart, label: 'Followers', count: userCounts.followers },
                  { key: 'following', icon: FaUserFriends, label: 'Following', count: userCounts.following },
                  { key: 'all', icon: FaUsers, label: 'All', count: allUsers.length }
                ].map(tab => (
                  <motion.button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative p-3 rounded-lg font-mono text-xs transition-all ${
                      activeTab === tab.key
                        ? 'bg-stellar-blue/20 text-stellar-blue shadow-stellar-blue-glow'
                        : 'text-space-muted hover:text-space-text hover:bg-space-dark/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="truncate">{tab.label}</div>
                    {tab.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-stellar-orange text-space-void text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Search */}
            {activeTab === 'all' && (
              <div className="flex-shrink-0 p-4 border-b border-stellar-blue/20">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-space-muted w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search personnel..."
                    className="w-full pl-10 pr-4 py-3 bg-space-void/50 border border-stellar-blue/30 rounded-xl text-white placeholder-space-muted font-mono text-sm focus:outline-none focus:border-stellar-blue focus:shadow-stellar-blue-glow transition-all"
                  />
                </div>
              </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-blue"></div>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {getCurrentUsers().map((chatUser) => {
                    const user = chatUser.user || chatUser;
                    const isOnline = isUserOnline(user._id || chatUser._id);
                    const isActive = selectedChat?._id === (user._id || chatUser._id);
                    
                    return (
                      <motion.div
                        key={user._id || chatUser._id}
                        onClick={() => loadMessages(user._id ? chatUser : { ...user, _id: chatUser._id })}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          isActive
                            ? 'bg-stellar-blue/20 shadow-stellar-blue-glow border-l-4 border-stellar-blue'
                            : 'hover:bg-space-dark/50 border-l-4 border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-stellar-blue to-stellar-purple flex items-center justify-center text-white font-bold">
                              {user.profilePic ? (
                                <img
                                  src={user.profilePic}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                user.username?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-space-darker ${
                              isOnline ? 'bg-stellar-green' : 'bg-space-muted'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-mono font-semibold text-white truncate">
                                {user.username || 'Unknown User'}
                              </h3>
                              {chatUser.lastMessage && (
                                <span className="text-xs text-space-muted font-mono">
                                  {formatTime(chatUser.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            
                            {chatUser.lastMessage ? (
                              <p className="text-sm text-space-muted truncate font-mono">
                                {chatUser.lastMessage}
                              </p>
                            ) : (
                              <p className="text-sm text-space-muted font-mono">
                                {isOnline ? 'Online' : 'Offline'}
                              </p>
                            )}
                          </div>

                          {chatUser.unreadCount > 0 && (
                            <div className="bg-stellar-orange text-space-void text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 font-bold">
                              {chatUser.unreadCount}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {getCurrentUsers().length === 0 && !isLoading && (
                    <div className="text-center p-8 text-space-muted">
                      <FaUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-mono">
                        {activeTab === 'recent' && 'No recent communications'}
                        {activeTab === 'followers' && 'No followers found'}
                        {activeTab === 'following' && 'Not following anyone'}
                        {activeTab === 'all' && (searchQuery ? 'No users found' : 'Loading personnel directory...')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div 
            className="w-full lg:w-2/3"
            style={{ height: '100%', maxHeight: '100%' }}
          >
            {selectedChat ? (
              <div 
                className="bg-gradient-to-b from-space-darker/80 to-space-dark/80 rounded-2xl border border-stellar-blue/30 flex flex-col overflow-hidden"
                style={{ height: '100%', maxHeight: '100%' }}
              >
                
                {/* Chat Header */}
                <div className="flex-shrink-0 p-4 border-b border-stellar-blue/20 bg-gradient-to-r from-space-darker/50 to-space-dark/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="lg:hidden p-2 hover:bg-space-dark/50 rounded-lg transition-colors"
                      >
                        <FaArrowLeft className="w-4 h-4 text-space-text" />
                      </button>
                      
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-stellar-blue to-stellar-purple flex items-center justify-center text-white font-bold">
                          {selectedChat.profilePic ? (
                            <img
                              src={selectedChat.profilePic}
                              alt={selectedChat.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            selectedChat.username?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-space-darker ${
                          isUserOnline(selectedChat._id) ? 'bg-stellar-green' : 'bg-space-muted'
                        }`} />
                      </div>
                      
                      <div>
                        <h2 className="font-mono font-bold text-white text-lg">
                          {selectedChat.username || 'Unknown User'}
                        </h2>
                        <p className="text-sm font-mono text-space-muted">
                          {isUserOnline(selectedChat._id) ? 'Online' : 'Last seen recently'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Call Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-stellar-green/20 hover:bg-stellar-green/30 rounded-xl transition-colors"
                      >
                        <FaPhone className="w-4 h-4 text-stellar-green" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-stellar-blue/20 hover:bg-stellar-blue/30 rounded-xl transition-colors"
                      >
                        <FaVideo className="w-4 h-4 text-stellar-blue" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-space-dark/50 hover:bg-space-dark rounded-xl transition-colors"
                      >
                        <FaEllipsisV className="w-4 h-4 text-space-text" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative min-h-0"
                >
                  {messages.map((message, index) => {
                    const isOwn = message.sender === user._id;
                    const showDate = index === 0 || 
                      new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                    
                    return (
                      <div key={index}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <span className="bg-space-dark/50 text-space-muted px-4 py-2 rounded-full text-sm font-mono">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl font-mono ${
                            isOwn
                              ? 'bg-gradient-to-r from-stellar-blue to-stellar-purple text-white'
                              : 'bg-space-dark/50 text-space-text border border-stellar-blue/20'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              isOwn ? 'text-white/70' : 'text-space-muted'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {typingUsers.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-space-dark/50 px-4 py-3 rounded-2xl border border-stellar-blue/20">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-stellar-blue rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-stellar-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-stellar-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-space-muted font-mono">
                              {Array.from(typingUsers).join(', ')} typing...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                  {showScrollButton && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scrollToBottom(true)}
                      className="absolute bottom-20 right-6 bg-stellar-blue hover:bg-stellar-blue/80 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-stellar-blue-glow z-10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Message Input */}
                <div className="flex-shrink-0 p-4 border-t border-stellar-blue/20 bg-gradient-to-r from-space-darker/50 to-space-dark/50">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1 bg-space-void/50 border border-stellar-blue/30 rounded-2xl overflow-hidden focus-within:border-stellar-blue focus-within:shadow-stellar-blue-glow transition-all">
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleStartTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        rows="1"
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-space-muted font-mono text-sm resize-none focus:outline-none"
                        style={{ maxHeight: '80px', minHeight: '44px' }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-stellar-purple/20 hover:bg-stellar-purple/30 rounded-xl transition-colors"
                      >
                        <FaMicrophone className="w-4 h-4 text-stellar-purple" />
                      </motion.button>
                      
                      <motion.button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-xl transition-all ${
                          newMessage.trim()
                            ? 'bg-stellar-blue hover:bg-stellar-blue/80 text-white shadow-stellar-blue-glow'
                            : 'bg-space-dark/50 text-space-muted cursor-not-allowed'
                        }`}
                      >
                        <FaPaperPlane className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Welcome Screen
              <div className="bg-gradient-to-b from-space-darker/80 to-space-dark/80 rounded-2xl border border-stellar-blue/30 h-full max-h-full flex items-center justify-center min-h-0">
                <div className="text-center max-w-md">
                  <div className="relative mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto bg-gradient-to-r from-stellar-blue via-stellar-purple to-stellar-orange rounded-full flex items-center justify-center"
                    >
                      <FaRocket className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 w-20 h-20 mx-auto border-2 border-stellar-blue rounded-full"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-mono font-bold text-white mb-4">
                    MISSION CONTROL READY
                  </h2>
                  <p className="text-space-muted font-mono mb-6">
                    Select a contact from the crew manifest to establish secure communication.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div className="bg-space-dark/50 p-3 rounded-xl border border-stellar-green/30">
                      <FaCircle className="w-2 h-2 text-stellar-green inline mr-2" />
                      <span className="text-stellar-green">SYSTEMS ONLINE</span>
                    </div>
                    <div className="bg-space-dark/50 p-3 rounded-xl border border-stellar-blue/30">
                      <FaUsers className="w-4 h-4 text-stellar-blue inline mr-2" />
                      <span className="text-stellar-blue">{onlineUsers.size} ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;
