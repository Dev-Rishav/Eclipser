/**
 * Connection Status Debug Panel
 * Shows real-time connection status for debugging
 */

import { useState, useEffect } from 'react';
import { connectionMonitor } from '../config/connectionMonitor.js';

export const ConnectionDebugPanel = () => {
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateStatus = () => {
      setStatus(connectionMonitor.getStatus());
      setEvents(connectionMonitor.getRecentEvents(10));
    };

    // Update immediately
    updateStatus();

    // Update every 3 seconds
    const interval = setInterval(updateStatus, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleConnect = () => {
    connectionMonitor.connectAll();
  };

  const handleDisconnect = () => {
    connectionMonitor.disconnectAll();
  };

  const formatUptime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          🔧 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          🔧 Connection Debug
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-80">
        {status && (
          <>
            {/* Status Overview */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uptime: {formatUptime(status.uptime)}
              </div>
            </div>

            {/* SSE Status */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${status.sse.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                SSE Connection
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>State: {status.sse.readyStateString}</div>
                <div>Reconnects: {status.sse.reconnectAttempts}</div>
                <div>Events: {status.sse.eventHistoryCount}</div>
              </div>
            </div>

            {/* Socket.IO Status */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${status.socket.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Socket.IO
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>ID: {status.socket.socketId || 'None'}</div>
                <div>Transport: {status.socket.transport || 'None'}</div>
                <div>Reconnects: {status.socket.reconnectAttempts}</div>
                <div>Events: {status.socket.eventHistoryCount}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleConnect}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Connect All
              </button>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Recent Events */}
            {events.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Recent Events
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {events.map((event, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400">
                        {event.source}
                      </span>
                      {': '}
                      <span>{event.type || event.event}</span>
                      <span className="text-gray-500 ml-1">
                        ({new Date(event.timestamp).toLocaleTimeString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionDebugPanel;
