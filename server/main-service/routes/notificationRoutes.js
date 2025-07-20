const express = require('express');
const authMiddleware = require('../middlewares/auth');
const {
  streamNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  testNotification,
  debugSSEStatus,
  debugSendNotification
} = require('../controllers/notificationController');

const router = express.Router();

// SSE endpoint for real-time notifications (handles auth internally)
router.get('/stream', streamNotifications);

// Get notifications
router.get('/', authMiddleware, getNotifications);

// Get unread count
router.get('/unread-count', authMiddleware, getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', authMiddleware, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, markAllAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

// Test notification (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', authMiddleware, testNotification);
  router.get('/debug/sse-status', authMiddleware, debugSSEStatus);
  router.post('/debug/send', authMiddleware, debugSendNotification);
}

module.exports = router;
