import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { showNotificationToast } from '../utils/notificationUtils';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Load notifications from API
  const loadNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, [isAuthenticated]);

  // Handle notification click actions
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.relatedEntity) return;

    const { entityType, entityId } = notification.relatedEntity;

    switch (entityType) {
      case 'post':
        navigate(`/post/${entityId}`);
        break;
      case 'user':
        navigate(`/profile/${entityId}`);
        break;
      case 'contest':
        navigate(`/contest/${entityId}`);
        break;
      default:
        // For system notifications or unknown types, go to feed
        navigate('/');
    }
  }, [navigate]);

  // Handle real-time notification events
  const handleNotificationEvent = useCallback((data) => {
    switch (data.type) {
      case 'connection':
        setIsConnected(data.status === 'connected');
        if (data.status === 'error' || data.status === 'failed') {
          setError(data.message || 'Connection error');
        } else {
          setError(null);
        }
        break;

      case 'notification':
        // Add new notification to the list
        console.log('📋 Received notification:', data.data);
        setNotifications(prev => [data.data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show simple notification toast
        showNotificationToast(data.data, {
          duration: 5000,
          onClick: () => {
            handleNotificationClick(data.data);
          }
        });
        break;

      case 'unread_count':
        setUnreadCount(data.count);
        break;

      case 'heartbeat':
        // Connection is alive
        break;

      default:
        console.log('Unknown notification event:', data);
    }
  }, [handleNotificationClick]);

  // Connect to notification stream
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔗 Connecting to notification stream...');
      notificationService.connect(token);
      
      // Add event listener
      const removeListener = notificationService.addListener(handleNotificationEvent);
      
      return () => {
        removeListener();
        notificationService.disconnect();
      };
    }
  }, [isAuthenticated, token, handleNotificationEvent]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAuthenticated, loadNotifications, loadUnreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Handle both _id and id fields from MongoDB documents
      const id = notificationId || notificationId?._id;
      if (!id) {
        console.error('No notification ID provided');
        return;
      }

      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => {
          const currentId = notification.id || notification._id;
          return currentId === id 
            ? { ...notification, read: true }
            : notification;
        })
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Handle both _id and id fields from MongoDB documents
      const id = notificationId || notificationId?._id;
      if (!id) {
        console.error('No notification ID provided');
        return;
      }

      await notificationService.deleteNotification(id);
      
      // Update local state
      const notification = notifications.find(n => (n.id || n._id) === id);
      setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
      
      // Update unread count if the deleted notification was unread
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Send test notification (development only)
  const sendTestNotification = useCallback(async (data) => {
    try {
      await notificationService.sendTestNotification(data, token);
      toast.success('Test notification sent');
    } catch (err) {
      console.error('Error sending test notification:', err);
      toast.error('Failed to send test notification');
    }
  }, [token]);

  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    
    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    handleNotificationClick,
    
    // Utility
    refresh: loadNotifications
  };
};
