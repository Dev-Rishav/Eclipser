/**
 * Server-Sent Events (SSE) Configuration and Manager
 * Provides centralized SSE management with l      // Only reconnect if the connection is actually closed
      // Don't reconnect during normal connection attempts
      if (readyState === EventSource.CLOSED) {
        // Check if connection was stable for minimum time
        const connectionDuration = this.connectionStartTime 
          ? Date.now() - this.connectionStartTime 
          : 0;
        
        if (connectionDuration < this.minConnectionTime) {
          apiLog(`🚨 SSE connection was unstable (${connectionDuration}ms), waiting before reconnect...`);
          // Wait longer before reconnecting if connection was unstable
          setTimeout(() => {
            if (!this.isConnected) {
              this.scheduleReconnect();
            }
          }, 10000); // Wait 10 seconds for unstable connections
        } else {
          apiLog('🔌 SSE connection closed after stable period, scheduling reconnect...');
          this.scheduleReconnect();
        }
      } else if (readyState === EventSource.CONNECTING) {
        apiLog('🔄 SSE still connecting, waiting...');
        // Don't trigger reconnect immediately during connection attempts
      }d error handling
 */

import { API_CONFIG, apiLog, apiError } from './api.js';

class SSEManager {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.heartbeatInterval = null;
    this.connectionStartTime = null;
    this.minConnectionTime = 5000; // Minimum 5 seconds before considering reconnect
  }

  /**
   * Connect to SSE stream
   */
  connect(endpoint = '/stream') {
    if (this.eventSource && this.isConnected) {
      apiLog('✅ SSE already connected, using existing connection');
      return;
    }

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    apiLog('🔄 Connecting to SSE stream:', url);

    try {
      this.eventSource = new EventSource(url, {
        withCredentials: true
      });

      this.setupEventListeners();
      this.startHeartbeat();
      this.setupVisibilityHandler();
    } catch (error) {
      apiError('❌ Failed to create SSE connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup page visibility handler to manage connections
   */
  setupVisibilityHandler() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          apiLog('📱 Page hidden, maintaining SSE connection');
          // Don't disconnect immediately, just note the state
        } else {
          apiLog('📱 Page visible, checking SSE connection');
          // Check if connection is still alive when page becomes visible
          setTimeout(() => {
            if (!this.isConnected && this.eventSource?.readyState === EventSource.CLOSED) {
              apiLog('🔄 Reconnecting SSE after page visibility change');
              this.connect();
            }
          }, 1000);
        }
      });
    }
  }

  /**
   * Setup event listeners for SSE
   */
  setupEventListeners() {
    if (!this.eventSource) return;

    // Connection opened
    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStartTime = Date.now(); // Track when connection started
      apiLog('✅ SSE connection established');
      this.logEvent('open', { timestamp: new Date() });
      
      // Clear any pending reconnect
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    // Message received
    this.eventSource.onmessage = (event) => {
      apiLog('📨 SSE message received:', event.data);
      this.logEvent('message', { 
        data: event.data, 
        timestamp: new Date(),
        lastEventId: event.lastEventId
      });

      try {
        const data = JSON.parse(event.data);
        this.handleMessage('message', data);
      } catch (error) {
        apiError('❌ Error parsing SSE message:', error);
        this.handleMessage('message', event.data);
      }
    };

    // Connection error
    this.eventSource.onerror = () => {
      const readyState = this.eventSource.readyState;
      this.isConnected = false;
      
      apiError('❌ SSE connection error', {
        readyState,
        readyStateString: this.getReadyStateString(),
        url: this.eventSource.url
      });
      
      this.logEvent('error', { 
        readyState,
        timestamp: new Date(),
        url: this.eventSource.url
      });

      // Only reconnect if the connection is actually closed
      // Don't reconnect during normal connection attempts
      if (readyState === EventSource.CLOSED) {
        apiLog('� SSE connection closed, scheduling reconnect...');
        this.scheduleReconnect();
      } else if (readyState === EventSource.CONNECTING) {
        apiLog('� SSE still connecting, waiting...');
        // Don't trigger reconnect immediately during connection attempts
      }
    };

    // Custom event listeners for specific events
    this.eventSource.addEventListener('postUpdate', (event) => {
      apiLog('📊 Post update received:', event.data);
      this.logEvent('postUpdate', { data: event.data, timestamp: new Date() });
      
      try {
        const data = JSON.parse(event.data);
        this.handleMessage('postUpdate', data);
      } catch (error) {
        apiError('❌ Error parsing post update:', error);
      }
    });

    this.eventSource.addEventListener('heartbeat', () => {
      apiLog('💓 SSE heartbeat received');
      this.logEvent('heartbeat', { timestamp: new Date() });
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(type, data) {
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        apiError(`❌ Error in SSE listener for ${type}:`, error);
      }
    });
  }

  /**
   * Log SSE events for debugging
   */
  logEvent(eventType, data) {
    const logEntry = {
      type: eventType,
      data,
      timestamp: new Date(),
      connected: this.isConnected,
      readyState: this.eventSource?.readyState
    };

    this.eventHistory.push(logEntry);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Less aggressive heartbeat - only check every 2 minutes
    // and only reconnect if connection has been stable for at least 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (!this.isConnected && this.eventSource?.readyState === EventSource.CLOSED) {
        // Only attempt reconnect if we've been disconnected for a while
        const lastEventTime = this.eventHistory.length > 0 
          ? new Date(this.eventHistory[this.eventHistory.length - 1].timestamp).getTime()
          : 0;
        const timeSinceLastEvent = Date.now() - lastEventTime;
        
        if (timeSinceLastEvent > 30000) { // 30 seconds since last event
          apiLog('💔 SSE heartbeat check: connection lost, attempting reconnect');
          this.scheduleReconnect();
        }
      }
    }, 120000); // Check every 2 minutes
  }

  /**
   * Check if server is reachable before attempting SSE connection
   */
  async checkServerHealth() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/greet`, {
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      apiError('❌ Server health check failed:', error);
      return false;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      apiError('❌ SSE max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      return; // Already scheduled
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    apiLog(`🔄 SSE reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      
      // Check if server is reachable before attempting reconnection
      const serverReachable = await this.checkServerHealth();
      if (!serverReachable) {
        apiError('❌ Server not reachable, skipping reconnection attempt');
        // Schedule another check later
        setTimeout(() => {
          if (!this.isConnected) {
            this.scheduleReconnect();
          }
        }, 15000); // Check again in 15 seconds
        return;
      }
      
      this.disconnect();
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    apiLog('🔌 SSE disconnected');
    this.logEvent('disconnect', { timestamp: new Date() });
  }

  /**
   * Add event listener
   */
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
    apiLog(`📝 SSE listener added for event: ${type}`);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type, callback) {
    if (!this.listeners.has(type)) return;

    const listeners = this.listeners.get(type);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
      apiLog(`🗑️ SSE listener removed for event: ${type}`);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.eventSource?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      eventHistoryCount: this.eventHistory.length,
      url: this.eventSource?.url
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit = 20) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Get ready state as string
   */
  getReadyStateString() {
    if (!this.eventSource) return 'DISCONNECTED';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'CONNECTING';
      case EventSource.OPEN:
        return 'OPEN';
      case EventSource.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Create singleton instance
export const sseManager = new SSEManager();

export default sseManager;
