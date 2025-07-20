// Redux actions for notification management
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import {
  NOTIFICATIONS_LOADING,
  NOTIFICATIONS_SUCCESS,
  NOTIFICATIONS_FAILURE,
  UNREAD_COUNT_LOADING,
  UNREAD_COUNT_SUCCESS,
  UNREAD_COUNT_FAILURE,
  NOTIFICATION_RECEIVED,
  NOTIFICATION_MARK_READ,
  NOTIFICATION_DELETE,
  NOTIFICATIONS_MARK_ALL_READ,
  SSE_CONNECTION_STATUS,
  CLEAR_NOTIFICATIONS
} from './notificationActionTypes';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Load notifications from API
 */
export const loadNotifications = (params = {}) => async (dispatch) => {
  dispatch({ type: NOTIFICATIONS_LOADING });
  
  try {
    const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      headers: getAuthHeaders(),
      params
    });

    dispatch({
      type: NOTIFICATIONS_SUCCESS,
      payload: {
        notifications: response.data.data.notifications,
        pagination: response.data.data.pagination,
        unreadCount: response.data.data.unreadCount
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to load notifications:', error);
    dispatch({
      type: NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || 'Failed to load notifications'
    });
    throw error;
  }
};

/**
 * Load unread notification count
 */
export const loadUnreadCount = () => async (dispatch) => {
  dispatch({ type: UNREAD_COUNT_LOADING });
  
  try {
    const response = await axios.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, {
      headers: getAuthHeaders()
    });

    dispatch({
      type: UNREAD_COUNT_SUCCESS,
      payload: response.data.data.count
    });

    return response.data.data.count;
  } catch (error) {
    console.error('Failed to load unread count:', error);
    dispatch({
      type: UNREAD_COUNT_FAILURE,
      payload: error.response?.data?.message || 'Failed to load unread count'
    });
    throw error;
  }
};

/**
 * Handle received notification from SSE/WebSocket
 * This includes post author information for better UX
 */
export const receiveNotification = (notification) => (dispatch) => {
  // Ensure notification has proper structure with post author
  const enrichedNotification = {
    ...notification,
    // If it's a post-related notification, ensure we have post author info
    postAuthor: notification.sender ? {
      _id: notification.sender._id,
      username: notification.sender.username,
      profilePic: notification.sender.profilePic
    } : null,
    timestamp: notification.createdAt || Date.now(),
    read: false
  };

  dispatch({
    type: NOTIFICATION_RECEIVED,
    payload: enrichedNotification
  });

  // Show toast notification for new notifications
  if (!notification.read) {
    const message = notification.postAuthor 
      ? `${notification.postAuthor.username} ${notification.message}`
      : notification.message;

    toast.success(`${notification.icon || '🔔'} ${notification.title}: ${message}`, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'var(--eclipse-surface)',
        color: 'var(--eclipse-text-light)',
        border: '1px solid var(--stellar-blue)',
        borderRadius: '8px',
        fontSize: '14px'
      }
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  try {
    await axios.patch(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
      {},
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: NOTIFICATION_MARK_READ,
      payload: notificationId
    });

  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    toast.error('Failed to mark notification as read');
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = () => async (dispatch) => {
  try {
    await axios.patch(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      {},
      { headers: getAuthHeaders() }
    );

    dispatch({ type: NOTIFICATIONS_MARK_ALL_READ });
    toast.success('All notifications marked as read');

  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    toast.error('Failed to mark all notifications as read');
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = (notificationId) => async (dispatch) => {
  try {
    await axios.delete(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId),
      { headers: getAuthHeaders() }
    );

    dispatch({
      type: NOTIFICATION_DELETE,
      payload: notificationId
    });

    toast.success('Notification deleted');

  } catch (error) {
    console.error('Failed to delete notification:', error);
    toast.error('Failed to delete notification');
    throw error;
  }
};

/**
 * Update SSE connection status
 */
export const updateConnectionStatus = (status) => ({
  type: SSE_CONNECTION_STATUS,
  payload: status
});

/**
 * Clear all notifications (for logout)
 */
export const clearNotifications = () => ({
  type: CLEAR_NOTIFICATIONS
});
