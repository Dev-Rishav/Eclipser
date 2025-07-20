// Example component demonstrating Redux notification system with post author binding
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationsRedux } from '../hooks/useNotificationsRedux';

const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    handleNotificationClick,
    getNotificationsByType
  } = useNotificationsRedux();

  const [showPanel, setShowPanel] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  // Filter notifications based on selected type
  const filteredNotifications = selectedType === 'all' 
    ? notifications 
    : getNotificationsByType(selectedType);

  // Get notification types available
  const availableTypes = ['all', ...new Set(notifications.map(n => n.type))];

  const handleNotificationItemClick = (notification) => {
    // This will mark as read and navigate appropriately
    // Post author information is automatically handled
    handleNotificationClick(notification);
    setShowPanel(false);
  };

  const renderNotification = (notification) => {
    const isPostNotification = notification.metadata?.isPostNotification;
    const postAuthor = notification.postAuthor || notification.sender;

    return (
      <motion.div
        key={notification.id || notification._id}
        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
        className={`p-4 border-b cursor-pointer transition-all ${
          !notification.read ? 'bg-stellar-blue/5 border-l-4 border-l-stellar-blue' : 'border-l-4 border-l-transparent'
        }`}
        onClick={() => handleNotificationItemClick(notification)}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">{notification.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-eclipse-text-light dark:text-space-text truncate">
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <div className="w-2 h-2 bg-stellar-blue rounded-full" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id || notification._id);
                  }}
                  className="text-xs text-eclipse-muted-light hover:text-stellar-orange transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="mt-1">
              {/* Enhanced message with post author context */}
              {isPostNotification && postAuthor ? (
                <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                  <span className="font-medium text-stellar-blue">
                    {postAuthor.username}
                  </span>{' '}
                  {notification.message}
                </p>
              ) : (
                <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                  {notification.message}
                </p>
              )}
            </div>

            {/* Show post context if available */}
            {isPostNotification && notification.metadata?.postTitle && (
              <div className="mt-2 p-2 bg-eclipse-border/20 rounded text-xs text-eclipse-muted-light">
                📄 {notification.metadata.postTitle}
              </div>
            )}

            <p className="text-xs text-stellar-blue/60 mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-stellar-blue/10 border border-stellar-blue/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-5 h-5 text-eclipse-muted-light dark:text-space-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7v10l5-5-5-5z" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-stellar-orange text-white rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        <div className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full ${
          isConnected ? 'bg-stellar-green' : 'bg-red-500'
        }`} />
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-eclipse-surface dark:bg-space-darker rounded-lg border border-eclipse-border dark:border-space-gray shadow-lg overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-eclipse-border dark:border-space-gray">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-eclipse-text-light dark:text-space-text">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-stellar-blue hover:text-stellar-blue/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {import.meta.env.DEV && (
                    <button
                      onClick={() => sendTestNotification({
                        type: 'like',
                        title: 'Test Notification',
                        message: 'This is a test notification with post author binding!',
                        icon: '🧪'
                      })}
                      className="text-sm text-stellar-purple hover:text-stellar-purple/80 transition-colors"
                    >
                      Test
                    </button>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex space-x-2 mt-2 overflow-x-auto">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                      selectedType === type
                        ? 'bg-stellar-blue text-white'
                        : 'bg-eclipse-border dark:bg-space-gray text-eclipse-text-light dark:text-space-text hover:bg-stellar-blue/20'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-blue mx-auto"></div>
                  <p className="text-sm text-eclipse-muted-light mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map(renderNotification)
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔕</div>
                  <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
