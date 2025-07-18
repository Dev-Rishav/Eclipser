/**
 * Real-time Connection Monitor
 * Provides debugging and monitoring for SSE and Socket.IO connections
 */

import { sseManager } from './sseConfig.js';
import { socketManager } from './socket.js';
import { apiLog, apiError } from './api.js';

class ConnectionMonitor {
  constructor() {
    this.isLogging = true;
    this.logHistory = [];
    this.maxLogHistory = 200;
    this.startTime = new Date();
  }

  /**
   * Initialize monitoring for all real-time connections
   */
  initialize() {
    apiLog('🔧 Initializing Connection Monitor');
    
    // Log initial state
    this.logConnectionStatus();
    
    // Setup periodic monitoring
    this.startPeriodicMonitoring();
    
    // Add global error handlers
    this.setupGlobalErrorHandlers();
    
    return this;
  }

  /**
   * Connect SSE and Socket.IO with logging
   */
  connectAll() {
    apiLog('🚀 Connecting all real-time services...');
    
    // Connect SSE
    try {
      sseManager.connect();
      this.log('SSE', 'Connection initiated');
    } catch (error) {
      this.logError('SSE', 'Connection failed', error);
    }
    
    // Connect Socket.IO
    try {
      socketManager.connect();
      this.log('Socket.IO', 'Connection initiated');
    } catch (error) {
      this.logError('Socket.IO', 'Connection failed', error);
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll() {
    apiLog('🔌 Disconnecting all real-time services...');
    
    try {
      sseManager.disconnect();
      this.log('SSE', 'Disconnected');
    } catch (error) {
      this.logError('SSE', 'Disconnect error', error);
    }
    
    try {
      socketManager.disconnect();
      this.log('Socket.IO', 'Disconnected');
    } catch (error) {
      this.logError('Socket.IO', 'Disconnect error', error);
    }
  }

  /**
   * Get comprehensive connection status
   */
  getStatus() {
    const sseStatus = sseManager.getStatus();
    const socketStatus = socketManager.getStatus();
    
    return {
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      sse: {
        ...sseStatus,
        readyStateString: sseManager.getReadyStateString()
      },
      socket: socketStatus,
      logging: {
        enabled: this.isLogging,
        historyCount: this.logHistory.length
      }
    };
  }

  /**
   * Log connection status to console
   */
  logConnectionStatus() {
    const status = this.getStatus();
    
    console.group('📊 Real-time Connection Status');
    console.log('Uptime:', Math.round(status.uptime / 1000), 'seconds');
    
    console.group('🔄 SSE Status');
    console.log('Connected:', status.sse.connected);
    console.log('State:', status.sse.readyStateString);
    console.log('Reconnect Attempts:', status.sse.reconnectAttempts);
    console.log('Event History:', status.sse.eventHistoryCount);
    if (status.sse.url) console.log('URL:', status.sse.url);
    console.groupEnd();
    
    console.group('🔌 Socket.IO Status');
    console.log('Connected:', status.socket.connected);
    console.log('Socket ID:', status.socket.socketId || 'Not connected');
    console.log('Transport:', status.socket.transport || 'Unknown');
    console.log('Reconnect Attempts:', status.socket.reconnectAttempts);
    console.log('Event History:', status.socket.eventHistoryCount);
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Get recent events from both connections
   */
  getRecentEvents(limit = 20) {
    const sseEvents = sseManager.getEventHistory(limit).map(event => ({
      ...event,
      source: 'SSE'
    }));
    
    const socketEvents = socketManager.getEventHistory(limit).map(event => ({
      ...event,
      source: 'Socket.IO'
    }));
    
    const allEvents = [...sseEvents, ...socketEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return allEvents;
  }

  /**
   * Log recent events to console
   */
  logRecentEvents(limit = 10) {
    const events = this.getRecentEvents(limit);
    
    console.group(`📈 Recent Events (${events.length})`);
    events.forEach(event => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      const source = event.source;
      const type = event.type || event.event;
      
      console.log(`[${time}] ${source}: ${type}`, event.data || '');
    });
    console.groupEnd();
  }

  /**
   * Start periodic monitoring
   */
  startPeriodicMonitoring() {
    // Log status every 5 minutes
    setInterval(() => {
      if (this.isLogging) {
        apiLog('📊 Periodic connection check');
        this.logConnectionStatus();
      }
    }, 5 * 60 * 1000);
    
    // Log recent events every minute if there's activity
    setInterval(() => {
      if (this.isLogging) {
        const events = this.getRecentEvents(5);
        if (events.length > 0) {
          apiLog('📈 Recent activity detected');
          this.logRecentEvents(5);
        }
      }
    }, 60 * 1000);
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('EventSource') || 
          event.reason?.message?.includes('socket')) {
        this.logError('Global', 'Unhandled promise rejection', event.reason);
      }
    });
    
    // Handle general errors
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('EventSource') || 
          event.error?.message?.includes('socket')) {
        this.logError('Global', 'Global error', event.error);
      }
    });
  }

  /**
   * Log with source identification
   */
  log(source, message, data = null) {
    const logEntry = {
      source,
      message,
      data,
      timestamp: new Date(),
      level: 'info'
    };
    
    this.addToHistory(logEntry);
    
    if (this.isLogging) {
      apiLog(`[${source}] ${message}`, data);
    }
  }

  /**
   * Log error with source identification
   */
  logError(source, message, error = null) {
    const logEntry = {
      source,
      message,
      error: error?.message || error,
      timestamp: new Date(),
      level: 'error'
    };
    
    this.addToHistory(logEntry);
    
    if (this.isLogging) {
      apiError(`[${source}] ${message}`, error);
    }
  }

  /**
   * Add entry to log history
   */
  addToHistory(entry) {
    this.logHistory.push(entry);
    
    // Keep history size manageable
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory.shift();
    }
  }

  /**
   * Enable/disable logging
   */
  setLogging(enabled) {
    this.isLogging = enabled;
    apiLog('📝 Connection monitoring logging', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Get log history
   */
  getLogHistory(limit = 50) {
    return this.logHistory.slice(-limit);
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
    apiLog('🗑️ Connection monitor history cleared');
  }

  /**
   * Export status as JSON for debugging
   */
  exportStatus() {
    const status = this.getStatus();
    const events = this.getRecentEvents(50);
    const logs = this.getLogHistory(50);
    
    const report = {
      timestamp: new Date(),
      status,
      recentEvents: events,
      logs,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Create singleton instance
export const connectionMonitor = new ConnectionMonitor();

// Auto-initialize when module is loaded
connectionMonitor.initialize();

// Global debugging functions
window.debugConnections = () => {
  connectionMonitor.logConnectionStatus();
  connectionMonitor.logRecentEvents();
};

window.connectionStatus = () => connectionMonitor.getStatus();
window.exportConnectionDebug = () => {
  const report = connectionMonitor.exportStatus();
  console.log('Connection Debug Report:', report);
  return report;
};

export default connectionMonitor;
