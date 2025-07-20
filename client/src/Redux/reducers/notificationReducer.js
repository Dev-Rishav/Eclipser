// Redux reducer for notification management
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
} from '../actions/notificationActionTypes';

const initialState = {
  // Notifications data
  notifications: [],
  unreadCount: 0,
  
  // Loading states
  loading: false,
  unreadCountLoading: false,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Connection status
  isConnected: false,
  
  // Error handling
  error: null,
  
  // Last updated timestamp
  lastUpdated: null
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      };

    case NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        unreadCount: action.payload.unreadCount,
        error: null,
        lastUpdated: Date.now()
      };

    case NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        lastUpdated: Date.now()
      };

    case UNREAD_COUNT_LOADING:
      return {
        ...state,
        unreadCountLoading: true
      };

    case UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        unreadCountLoading: false,
        unreadCount: action.payload
      };

    case UNREAD_COUNT_FAILURE:
      return {
        ...state,
        unreadCountLoading: false,
        error: action.payload
      };

    case NOTIFICATION_RECEIVED: {
      // Add new notification to the beginning of the list
      // Also increment unread count if it's unread
      const newNotification = action.payload;
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1,
        lastUpdated: Date.now()
      };
    }

    case NOTIFICATION_MARK_READ: {
      // Mark specific notification as read and decrease unread count
      const notificationId = action.payload;
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === notificationId || notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    }

    case NOTIFICATIONS_MARK_ALL_READ:
      // Mark all notifications as read and reset unread count
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };

    case NOTIFICATION_DELETE: {
      // Remove notification from list and adjust unread count if it was unread
      const deletedNotificationId = action.payload;
      const deletedNotification = state.notifications.find(
        n => n.id === deletedNotificationId || n._id === deletedNotificationId
      );
      
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== deletedNotificationId && 
                          notification._id !== deletedNotificationId
        ),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount
      };
    }

    case SSE_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload === 'connected'
      };

    case CLEAR_NOTIFICATIONS:
      // Reset to initial state (for logout)
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default notificationReducer;
