const notificationService = require('../services/notificationService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * SSE endpoint for real-time notifications
 */
exports.streamNotifications = async (req, res) => {
  try {
    // Handle authentication for SSE (token from query parameter)
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    const userId = user._id.toString();
    
    // Register this client for notifications
    const clientId = notificationService.registerSSEClient(userId, res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      message: 'Notification stream connected',
      timestamp: Date.now()
    })}\n\n`);

    // Send current unread count
    notificationService.getUnreadCount(userId)
      .then(unreadCount => {
        res.write(`data: ${JSON.stringify({
          type: 'unread_count',
          count: unreadCount,
          timestamp: Date.now()
        })}\n\n`);
      })
      .catch(error => {
        console.error('Error getting unread count:', error);
      });

    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE connection closed for user ${userId}`);
      notificationService.unregisterSSEClient(userId, clientId);
    });

    req.on('error', (error) => {
      console.error(`SSE connection error for user ${userId}:`, error);
      notificationService.unregisterSSEClient(userId, clientId);
    });

  } catch (error) {
    console.error('Authentication error for SSE:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Get notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = req.query;

    const result = await notificationService.getNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const deletedNotification = await notificationService.deleteNotification(notificationId, userId);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

/**
 * Test notification endpoint (for development)
 */
exports.testNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type = 'system', 
      title = 'Test Notification', 
      message = 'This is a test notification from the system',
      icon = '🧪',
      markAsReadImmediately = true  // Test notifications should not appear as unread by default
    } = req.body;

    const notification = await notificationService.createNotification({
      recipientId: userId,
      senderId: userId,
      type,
      title,
      message,
      icon,
      priority: 'medium',
      metadata: {
        isTestNotification: true,
        autoRead: markAsReadImmediately
      }
    });

    // If markAsReadImmediately is true, mark the notification as read
    if (markAsReadImmediately) {
      await notification.markAsRead();
    }

    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test notification',
      error: error.message
    });
  }
};

/**
 * Debug endpoint to check SSE client status
 */
exports.debugSSEStatus = async (req, res) => {
  try {
    const status = notificationService.getSSEClientStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting SSE status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting SSE status',
      error: error.message
    });
  }
};

/**
 * Debug endpoint to send notification to specific user
 */
exports.debugSendNotification = async (req, res) => {
  try {
    const { targetUserId, title = 'Debug Notification', message = 'This is a debug notification' } = req.body;
    const userId = req.user.id;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'targetUserId is required'
      });
    }

    const notification = await notificationService.createNotification({
      recipientId: targetUserId,
      senderId: userId,
      type: 'system',
      title,
      message,
      icon: '🐛',
      priority: 'medium'
    });

    res.status(200).json({
      success: true,
      message: 'Debug notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending debug notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending debug notification',
      error: error.message
    });
  }
};

module.exports = {
  streamNotifications: exports.streamNotifications,
  getNotifications: exports.getNotifications,
  getUnreadCount: exports.getUnreadCount,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead,
  deleteNotification: exports.deleteNotification,
  testNotification: exports.testNotification,
  debugSSEStatus: exports.debugSSEStatus,
  debugSendNotification: exports.debugSendNotification
};
