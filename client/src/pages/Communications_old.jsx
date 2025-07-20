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
  FaPlus,
  FaUserFriends,
  FaHeart,
  FaClock,
  FaComments
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
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
  }, [user?._id]);

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
      // For now, we'll use a simulated approach since we don't have dedicated endpoints
      // In a real implementation, you would call specific followers endpoint
      
      // Simulate followers by getting users and filtering
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
      const users = response.data?.users || [];
      
      // For demo purposes, consider first 10 users as followers
      const simulatedFollowers = users.slice(0, Math.min(10, users.length))
        .filter(u => u._id !== user._id);
      
      setFollowers(simulatedFollowers);
      setUserCounts(prev => ({ ...prev, followers: simulatedFollowers.length }));
      
      apiLog('👥 Followers loaded:', simulatedFollowers.length);
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
      
      // Simulate following users
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
      const users = response.data?.users || [];
      
      // For demo purposes, consider last 10 users as following
      const simulatedFollowing = users.slice(-Math.min(10, users.length))
        .filter(u => u._id !== user._id);
      
      setFollowing(simulatedFollowing);
      setUserCounts(prev => ({ ...prev, following: simulatedFollowing.length }));
      
      apiLog('👥 Following loaded:', simulatedFollowing.length);
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
      // Implement search functionality
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

    // Socket event listeners
    socket.on('private_message', handleNewMessage);
    socket.on('newPrivateMessage', handleMessageAcknowledgment);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('private_message');
      socket.off('newPrivateMessage');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('typing_start');
      socket.off('typing_stop');
    };
  }, [user?._id]);

  // Load initial chats
  useEffect(() => {
    loadRecentChats();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRecentChats = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.RECENT_CHATS);
      setChats(response.data.chats || []);
      apiLog('✅ Recent chats loaded:', response.data.chats?.length);
    } catch (error) {
      apiError('❌ Failed to load chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.BY_USER(userId));
      setMessages(response.data.messages || []);
      apiLog('✅ Messages loaded for user:', userId);
    } catch (error) {
      apiError('❌ Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    
    // Update recent chats
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.user._id === message.senderId || chat.user._id === message.receiverId) {
          return {
            ...chat,
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt
            }
          };
        }
        return chat;
      });
      return updatedChats;
    });
  }, []);

  const handleMessageAcknowledgment = useCallback((message) => {
    apiLog('✅ Message sent successfully:', message._id);
  }, []);

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
    apiLog('🔴 User offline:', userId);
  }, []);

  const handleTypingStart = useCallback((userId) => {
    setTypingUsers(prev => new Set([...prev, userId]));
  }, []);

  const handleTypingStop = useCallback((userId) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedChat.user._id,
      content: newMessage.trim()
    };

    // Optimistically add message
    const tempMessage = {
      ...messageData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      socket.emit('privateMessage', messageData);
      apiLog('📤 Message sent via socket:', messageData);
    } catch (error) {
      apiError('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    loadMessages(chat.user._id);
    apiLog('💬 Chat selected:', chat.user.username);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const filteredChats = chats.filter(chat =>
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text">
      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-stellar-blue/10 via-transparent to-stellar-purple/10" />
        
        {/* Floating Communication Signals */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-stellar-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Main Container */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3">
              <FaRocket className="text-stellar-blue text-3xl animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-space-text uppercase tracking-wider">
                  Mission Communications
                </h1>
                <p className="text-space-muted mt-1">
                  Secure channel for mission-critical communications
                </p>
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
            
            {/* Chat List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-space-dark border border-space-gray rounded-2xl overflow-hidden ${
                selectedChat ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Chat List Header */}
              <div className="p-6 border-b border-space-gray bg-gradient-to-r from-space-dark to-space-darker">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-space-text flex items-center space-x-2">
                    <FaUsers className="text-stellar-blue" />
                    <span>Active Channels</span>
                  </h2>
                  <button className="p-2 text-stellar-blue hover:bg-space-light/20 rounded-lg transition-colors">
                    <FaPlus size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-space-muted" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-space-darker border border-space-gray rounded-xl text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue/20 transition-colors"
                  />
                </div>
              </div>

              {/* Chat List Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-space-muted">
                    <div className="w-8 h-8 border-2 border-stellar-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Loading communications...
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredChats.map((chat) => (
                      <motion.button
                        key={chat.user._id}
                        onClick={() => handleChatSelect(chat)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          selectedChat?.user._id === chat.user._id
                            ? 'bg-stellar-blue/20 border border-stellar-blue/50'
                            : 'bg-space-darker hover:bg-space-light/20 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative">
                            {chat.user.profilePic ? (
                              <img
                                src={chat.user.profilePic}
                                alt={chat.user.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-stellar-blue/50"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-stellar-blue flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {chat.user.username[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Online Status */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-space-dark ${
                              onlineUsers.has(chat.user._id) ? 'bg-stellar-green' : 'bg-space-gray'
                            }`} />
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-space-text truncate">
                                {chat.user.username}
                              </span>
                              {chat.lastMessage && (
                                <span className="text-xs text-space-muted">
                                  {formatTime(chat.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            
                            {chat.lastMessage && (
                              <p className="text-sm text-space-muted truncate mt-1">
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}

                    {filteredChats.length === 0 && !isLoading && (
                      <div className="text-center py-12 text-space-muted">
                        <FaUsers className="mx-auto text-4xl mb-4 opacity-50" />
                        <p>No active communications</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Chat Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`lg:col-span-2 bg-space-dark border border-space-gray rounded-2xl overflow-hidden flex flex-col ${
                !selectedChat ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-space-gray bg-gradient-to-r from-space-dark to-space-darker">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Back Button (mobile) */}
                        <button
                          onClick={handleBackToChats}
                          className="lg:hidden p-2 text-space-muted hover:text-stellar-blue transition-colors"
                        >
                          <FaArrowLeft />
                        </button>

                        {/* Contact Info */}
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {selectedChat.user.profilePic ? (
                              <img
                                src={selectedChat.user.profilePic}
                                alt={selectedChat.user.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-stellar-blue/50"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-stellar-blue flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {selectedChat.user.username[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            <FaCircle className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                              onlineUsers.has(selectedChat.user._id) ? 'text-stellar-green' : 'text-space-gray'
                            }`} />
                          </div>

                          <div>
                            <h3 className="font-bold text-space-text">
                              {selectedChat.user.username}
                            </h3>
                            <p className="text-sm text-space-muted">
                              {onlineUsers.has(selectedChat.user._id) ? 'Online' : 'Offline'}
                              {typingUsers.has(selectedChat.user._id) && ' • Typing...'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-space-muted hover:text-stellar-blue transition-colors">
                          <FaPhone size={18} />
                        </button>
                        <button className="p-2 text-space-muted hover:text-stellar-blue transition-colors">
                          <FaVideo size={18} />
                        </button>
                        <button className="p-2 text-space-muted hover:text-stellar-blue transition-colors">
                          <FaEllipsisV size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => {
                        const isOwn = message.senderId === user._id;
                        const showDate = index === 0 || 
                          formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                        return (
                          <div key={message._id}>
                            {/* Date Separator */}
                            {showDate && (
                              <div className="text-center my-4">
                                <span className="px-3 py-1 bg-space-darker rounded-full text-xs text-space-muted">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            )}

                            {/* Message */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                isOwn
                                  ? 'bg-gradient-to-r from-stellar-blue to-stellar-purple text-white'
                                  : 'bg-space-darker text-space-text'
                              }`}>
                                <p className="break-words">{message.content}</p>
                                <div className={`text-xs mt-2 ${
                                  isOwn ? 'text-white/70' : 'text-space-muted'
                                }`}>
                                  {formatTime(message.createdAt)}
                                  {message.status === 'sending' && (
                                    <span className="ml-2 opacity-50">Sending...</span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </AnimatePresence>
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-space-gray bg-space-darker">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <input
                          ref={messageInputRef}
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your transmission..."
                          className="w-full px-4 py-3 bg-space-dark border border-space-gray rounded-xl text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue/20 transition-colors"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-3 text-space-muted hover:text-stellar-blue transition-colors"
                        >
                          <FaMicrophone size={18} />
                        </button>
                        
                        <motion.button
                          type="submit"
                          disabled={!newMessage.trim()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-xl hover:shadow-stellar-blue-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <FaPaperPlane size={18} />
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                /* No Chat Selected */
                <div className="flex-1 flex items-center justify-center text-center p-12">
                  <div>
                    <FaRocket className="mx-auto text-6xl text-stellar-blue/50 mb-6 animate-pulse" />
                    <h3 className="text-2xl font-bold text-space-text mb-4">
                      Mission Communications Ready
                    </h3>
                    <p className="text-space-muted max-w-md">
                      Select a communication channel to begin secure transmission with your fellow astronauts.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;
