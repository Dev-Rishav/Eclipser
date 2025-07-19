/**
 * SSE Connection Test and Debug Utility
 * Use this to test and debug SSE connections
 */

import { sseManager } from '../config/sseConfig.js';

export const testSSEConnection = () => {
  console.group('🧪 SSE Connection Test');
  
  // Log initial state
  console.log('Initial SSE Status:', sseManager.getStatus());
  
  // Connect to SSE
  console.log('🔄 Initiating SSE connection...');
  sseManager.connect();
  
  // Monitor connection for 30 seconds
  let checkCount = 0;
  const monitorInterval = setInterval(() => {
    checkCount++;
    const status = sseManager.getStatus();
    console.log(`Check ${checkCount}: Connected=${status.connected}, State=${sseManager.getReadyStateString()}, Attempts=${status.reconnectAttempts}`);
    
    if (checkCount >= 10) { // 30 seconds of monitoring
      clearInterval(monitorInterval);
      console.log('✅ SSE Connection test completed');
      console.log('Final Status:', status);
      console.log('Event History:', sseManager.getEventHistory(5));
      console.groupEnd();
    }
  }, 3000);
  
  return {
    stop: () => clearInterval(monitorInterval),
    getStatus: () => sseManager.getStatus(),
    getEvents: () => sseManager.getEventHistory()
  };
};

// Global debug functions for browser console
window.testSSE = testSSEConnection;
window.sseStatus = () => sseManager.getStatus();
window.sseHistory = () => sseManager.getEventHistory();
window.connectSSE = () => sseManager.connect();
window.disconnectSSE = () => sseManager.disconnect();

export default testSSEConnection;
