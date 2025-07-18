import { io } from "socket.io-client";
import { API_CONFIG, apiLog, apiError } from './api.js';

/**
 * Enhanced Socket.IO Configuration with Comprehensive Logging
 */

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Create and configure socket connection
   */
  createSocket() {
    if (this.socket) {
      apiLog('Socket already exists, using existing connection');
      return this.socket;
    }

    apiLog('🔄 Creating new socket connection to:', API_CONFIG.SOCKET_URL);

    this.socket = io(API_CONFIG.SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  /**
   * Setup comprehensive event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      apiLog('✅ Socket connected successfully:', this.socket.id);
      this.logEvent('connect', { socketId: this.socket.id, timestamp: new Date() });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      apiLog('🔌 Socket disconnected:', reason);
      this.logEvent('disconnect', { reason, timestamp: new Date() });
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      apiError('❌ Socket connection error:', error);
      this.logEvent('connect_error', { error: error.message, timestamp: new Date() });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      apiLog('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.logEvent('reconnect', { attemptNumber, timestamp: new Date() });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      apiLog('🔄 Socket reconnection attempt:', attemptNumber);
      this.logEvent('reconnect_attempt', { attemptNumber, timestamp: new Date() });
    });

    this.socket.on('reconnect_error', (error) => {
      apiError('❌ Socket reconnection error:', error);
      this.logEvent('reconnect_error', { error: error.message, timestamp: new Date() });
    });

    this.socket.on('reconnect_failed', () => {
      apiError('❌ Socket reconnection failed - max attempts reached');
      this.logEvent('reconnect_failed', { timestamp: new Date() });
    });

    // Listen to all events for debugging
    this.socket.onAny((eventName, ...args) => {
      if (!['connect', 'disconnect', 'connect_error', 'reconnect', 'reconnect_attempt', 'reconnect_error', 'reconnect_failed'].includes(eventName)) {
        apiLog(`📨 Socket event received: ${eventName}`, args);
        this.logEvent(eventName, args);
      }
    });

    // Listen to all outgoing events
    this.socket.onAnyOutgoing = this.socket.onAnyOutgoing || function() {};
    const originalOnAnyOutgoing = this.socket.onAnyOutgoing.bind(this.socket);
    this.socket.onAnyOutgoing = (eventName, ...args) => {
      apiLog(`📤 Socket event sent: ${eventName}`, args);
      this.logEvent(`${eventName}_sent`, args);
      originalOnAnyOutgoing(eventName, ...args);
    };
  }

  /**
   * Log socket events for debugging
   */
  logEvent(eventName, data) {
    const logEntry = {
      event: eventName,
      data,
      timestamp: new Date(),
      connected: this.isConnected,
      socketId: this.socket?.id
    };

    this.eventHistory.push(logEntry);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Connect socket
   */
  connect() {
    if (!this.socket) {
      this.createSocket();
    }

    if (!this.isConnected) {
      apiLog('🔌 Connecting socket...');
      this.socket.connect();
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      apiLog('🔌 Disconnecting socket...');
      this.socket.disconnect();
    }
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name,
      eventHistoryCount: this.eventHistory.length
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit = 20) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Add custom event listener
   */
  on(event, callback) {
    if (!this.socket) {
      this.createSocket();
    }
    this.socket.on(event, callback);
    apiLog(`📝 Socket listener added for event: ${event}`);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      apiLog(`🗑️ Socket listener removed for event: ${event}`);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.socket && this.isConnected) {
      apiLog(`📤 Emitting socket event: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      apiError(`❌ Cannot emit ${event}: socket not connected`);
    }
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// Create and export socket instance
const socket = socketManager.createSocket();

export default socket;
