// Enhanced notification hook with Redux integration and post author binding
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import {
  loadNotifications,
  loadUnreadCount,
  receiveNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  updateConnectionStatus,
  sendTestNotification,
  clearNotifications
} from '../Redux/actions/notificationActions';

export const useNotificationsRedux = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get state from Redux
  const {
    notifications,
    unreadCount,
    loading,
    unreadCountLoading,
    isConnected,
    error,
    pagination,
    lastUpdated
  } = useSelector((state) => state.notifications);
  
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  // Handle real-time notification events from SSE
  const handleNotificationEvent = useCallback((data) => {
    switch (data.type) {
      case 'notification': {
        // Enhanced notification with post author binding
        const enrichedNotification = {
          ...data.data,
          // Ensure we have proper post author information
          postAuthor: data.data.sender ? {
            _id: data.data.sender._id,
            username: data.data.sender.username,
            profilePic: data.data.sender.profilePic
          } : null,
          // Bind notification to the proper user context
          boundToUser: user?._id,
          receivedAt: Date.now()
        };
        
        dispatch(receiveNotification(enrichedNotification));
        break;
      }
      
      case 'unread_count':
        // Update unread count from server
        if (data.count !== undefined) {
          dispatch(loadUnreadCount());
        }
        break;
        
      case 'connected':
        dispatch(updateConnectionStatus('connected'));
        console.log('📡 Notification stream connected via Redux');
        break;
        
      case 'disconnected':
      case 'error':
        dispatch(updateConnectionStatus('disconnected'));
        console.log('📡 Notification stream disconnected via Redux');
        break;
        
      case 'heartbeat':
        // Keep connection alive - no action needed
        break;
        
      default:
        console.log('📬 Unknown notification event:', data);
    }
  }, [dispatch, user?._id]);

  // Connect to notification stream when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔗 Connecting to notification stream via Redux...');
      notificationService.connect(token);
      
      // Add event listener for real-time events
      const removeListener = notificationService.addListener(handleNotificationEvent);
      
      return () => {
        removeListener();
        notificationService.disconnect();
      };
    } else {
      // Clear notifications when not authenticated
      dispatch(clearNotifications());
    }
  }, [isAuthenticated, token, handleNotificationEvent, dispatch]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && (!notifications.length || !lastUpdated)) {
      dispatch(loadNotifications());
      dispatch(loadUnreadCount());
    }
  }, [isAuthenticated, notifications.length, lastUpdated, dispatch]);

  // Action handlers with post author context
  const handleLoadNotifications = useCallback((params = {}) => {
    return dispatch(loadNotifications(params));
  }, [dispatch]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [dispatch]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await dispatch(markAllNotificationsAsRead());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [dispatch]);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [dispatch]);

  const handleSendTestNotification = useCallback(async (testData = {}) => {
    try {
      await dispatch(sendTestNotification(testData));
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, [dispatch]);

  // Enhanced notification click handler with post author context
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id || notification._id);
    }

    // Navigate based on notification type and post author context
    if (notification.relatedEntity) {
      const { entityType, entityId } = notification.relatedEntity;

      switch (entityType) {
        case 'post':
          // Navigate to post with author context
          navigate(`/post/${entityId}`, {
            state: {
              postId: entityId,
              authorId: notification.postAuthor?._id,
              notificationContext: true
            }
          });
          break;
          
        case 'user':
          // Navigate to user profile (could be post author or follower)
          navigate(`/profile`, {
            state: {
              userId: entityId,
              fromNotification: true,
              notificationType: notification.type
            }
          });
          break;
          
        case 'contest':
          navigate(`/contest/${entityId}`);
          break;
          
        default:
          // For system notifications or unknown types
          navigate('/');
      }
    } else {
      // For notifications without related entities, go to appropriate default
      switch (notification.type) {
        case 'follow':
          // Navigate to the follower's profile
          if (notification.postAuthor) {
            navigate(`/profile`, {
              state: {
                userId: notification.postAuthor._id,
                fromNotification: true
              }
            });
          }
          break;
          
        case 'achievement':
        case 'system':
        default:
          navigate('/');
      }
    }
  }, [navigate, handleMarkAsRead]);

  // Utility functions
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getNotificationsByAuthor = useCallback((authorId) => {
    return notifications.filter(notification => 
      notification.postAuthor?._id === authorId || 
      notification.sender?._id === authorId
    );
  }, [notifications]);

  const refresh = useCallback(() => {
    if (isAuthenticated) {
      dispatch(loadNotifications());
      dispatch(loadUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    unreadCountLoading,
    isConnected,
    error,
    pagination,
    
    // Actions
    loadNotifications: handleLoadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    sendTestNotification: handleSendTestNotification,
    handleNotificationClick,
    
    // Utilities
    getNotificationsByType,
    getNotificationsByAuthor,
    refresh,
    
    // Authentication status
    isAuthenticated
  };
};
