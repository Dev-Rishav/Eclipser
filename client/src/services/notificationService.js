import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to the SSE stream for real-time notifications
   */
  connect(token) {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      // For SSE, we need to pass the token as a query parameter since EventSource doesn't support headers
      const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('📡 Notification stream connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.notifyListeners({ type: 'connection', status: 'connected' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📬 Notification received:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing notification data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Notification stream error:', error);
        this.notifyListeners({ type: 'connection', status: 'error', error });
        
        if (this.eventSource.readyState === EventSource.CLOSED) {
          this.handleReconnect(token);
        }
      };

    } catch (error) {
      console.error('Error creating EventSource:', error);
      this.handleReconnect(token);
    }
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`);
      
      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay);
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyListeners({ 
        type: 'connection', 
        status: 'failed', 
        message: 'Failed to reconnect after multiple attempts' 
      });
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('📡 Notification stream disconnected');
      this.notifyListeners({ type: 'connection', status: 'disconnected' });
    }
  }

  /**
   * Add a listener for notification events
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Get notifications via REST API
   */
  async getNotifications(params = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Send a test notification (development only)
   */
  async sendTestNotification(data = {}, token = null) {
    try {
      const authToken = token || localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/notifications/test`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
