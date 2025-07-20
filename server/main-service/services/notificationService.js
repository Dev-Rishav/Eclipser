const Notification = require('../models/Notification');
const { getIo } = require('../configs/socket');

/**
 * Notification Service
 * Handles creation, management, and real-time delivery of notifications
 */
class NotificationService {
  constructor() {
    this.sseClients = new Map(); // Store SSE connections per user
    this.setupCleanupJob();
  }

  /**
   * Register an SSE client for a specific user
   */
  registerSSEClient(userId, response) {
    // Convert userId to string for consistent storage
    const userIdString = userId.toString();
    
    if (!this.sseClients.has(userIdString)) {
      this.sseClients.set(userIdString, new Set());
    }
    
    const clientId = Date.now() + Math.random();
    const client = { id: clientId, response, userId: userIdString };
    
    this.sseClients.get(userIdString).add(client);
    
    console.log(`SSE client registered for user ${userIdString}. Total clients for this user: ${this.sseClients.get(userIdString).size}`);
    console.log(`Total users with SSE connections: ${this.sseClients.size}`);
    
    return clientId;
  }

  /**
   * Unregister an SSE client
   */
  unregisterSSEClient(userId, clientId) {
    // Convert userId to string for consistent lookup
    const userIdString = userId.toString();
    
    if (this.sseClients.has(userIdString)) {
      const clients = this.sseClients.get(userIdString);
      const clientToRemove = Array.from(clients).find(client => client.id === clientId);
      
      if (clientToRemove) {
        clients.delete(clientToRemove);
        
        if (clients.size === 0) {
          this.sseClients.delete(userIdString);
        }
        
        console.log(`SSE client unregistered for user ${userIdString}. Remaining clients: ${clients.size}`);
      }
    }
  }

  /**
   * Send real-time notification via SSE
   */
  sendRealtimeNotification(userId, notification) {
    // Convert userId to string for consistent lookup
    const userIdString = userId.toString();
    
    console.log(`Attempting to send notification to user: ${userIdString}`);
    console.log(`Total SSE clients: ${this.sseClients.size}`);
    
    // Debug: log all registered users
    this.sseClients.forEach((clients, registeredUserId) => {
      console.log(`Registered user: ${registeredUserId}, clients: ${clients.size}`);
    });
    
    if (this.sseClients.has(userIdString)) {
      const clients = this.sseClients.get(userIdString);
      console.log(`Found ${clients.size} clients for user ${userIdString}`);
      
      const data = JSON.stringify({
        type: 'notification',
        data: notification
      });

      // Send to all connected clients for this user
      let successCount = 0;
      clients.forEach(client => {
        try {
          console.log(`Sending SSE to client ${client.id} for user ${userIdString}`);
          client.response.write(`data: ${data}\n\n`);
          successCount++;
        } catch (error) {
          console.error(`Error sending SSE to client ${client.id}:`, error);
          // Remove dead connection
          clients.delete(client);
        }
      });
      
      console.log(`Successfully sent notification to ${successCount} clients`);

      // Clean up if no clients left
      if (clients.size === 0) {
        this.sseClients.delete(userIdString);
        console.log(`Cleaned up empty client list for user ${userIdString}`);
      }
    } else {
      console.log(`No SSE clients found for user ${userIdString}`);
    }

    // Also broadcast via WebSocket if available
    try {
      const io = getIo();
      io.to(`user_${userId}`).emit('notification', notification);
    } catch (error) {
      console.log('WebSocket not available for notification broadcast');
    }
  }

  /**
   * Create and send a notification
   */
  async createNotification({
    recipientId,
    senderId,
    type,
    title,
    message,
    icon = null,
    relatedEntity = null,
    metadata = {},
    priority = 'medium',
    expiresIn = null
  }) {
    try {
      // Set expiration date if provided
      let expiresAt = null;
      if (expiresIn) {
        expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + expiresIn);
      }

      // Set default icons based on type
      if (!icon) {
        const defaultIcons = {
          like: '❤️',
          comment: '💬',
          follow: '👥',
          post_mention: '📌',
          comment_mention: '@',
          achievement: '🏅',
          contest_update: '🏆',
          system: '🔔'
        };
        icon = defaultIcons[type] || '🔔';
      }

      // Create notification in database
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        message,
        icon,
        relatedEntity,
        metadata,
        priority,
        expiresAt,
        // If it's a test notification with autoRead, mark as read immediately
        read: metadata.autoRead === true
      });

      const savedNotification = await notification.save();
      
      // Populate sender information for real-time delivery
      await savedNotification.populate('sender', 'username profilePic');

      // Mark as delivered via real-time channel
      savedNotification.deliveryStatus.realtime = true;
      await savedNotification.save();

      // Send real-time notification
      this.sendRealtimeNotification(recipientId, {
        id: savedNotification._id,
        type: savedNotification.type,
        title: savedNotification.title,
        message: savedNotification.message,
        icon: savedNotification.icon,
        sender: savedNotification.sender,
        relatedEntity: savedNotification.relatedEntity,
        metadata: savedNotification.metadata,
        priority: savedNotification.priority,
        read: savedNotification.read,
        createdAt: savedNotification.createdAt
      });

      console.log(`Notification created and sent to user ${recipientId}: ${type}`);
      return savedNotification;

    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification for post likes
   */
  async notifyPostLike(postAuthorId, likerUserId, postId, postTitle) {
    // Don't notify if user liked their own post
    if (postAuthorId.toString() === likerUserId.toString()) return;

    return this.createNotification({
      recipientId: postAuthorId,
      senderId: likerUserId,
      type: 'like',
      title: 'New Like on Your Post',
      message: `liked your post "${postTitle.length > 50 ? postTitle.substring(0, 50) + '...' : postTitle}"`,
      relatedEntity: {
        entityType: 'post',
        entityId: postId
      },
      metadata: {
        postTitle,
        postId,
        action: 'like',
        // This will help frontend identify post-related notifications
        isPostNotification: true
      },
      priority: 'medium'
    });
  }

  /**
   * Send notification for post comments
   */
  async notifyPostComment(postAuthorId, commenterUserId, postId, postTitle, commentText) {
    // Don't notify if user commented on their own post
    if (postAuthorId.toString() === commenterUserId.toString()) return;

    return this.createNotification({
      recipientId: postAuthorId,
      senderId: commenterUserId,
      type: 'comment',
      title: 'New Comment on Your Post',
      message: `commented on your post "${postTitle.length > 30 ? postTitle.substring(0, 30) + '...' : postTitle}": "${commentText.length > 50 ? commentText.substring(0, 50) + '...' : commentText}"`,
      relatedEntity: {
        entityType: 'post',
        entityId: postId
      },
      metadata: {
        commentText: commentText.substring(0, 200),
        postTitle,
        postId,
        action: 'comment',
        // This will help frontend identify post-related notifications
        isPostNotification: true
      },
      priority: 'medium'
    });
  }

  /**
   * Send notification for new followers
   */
  async notifyNewFollower(followedUserId, followerUserId) {
    return this.createNotification({
      recipientId: followedUserId,
      senderId: followerUserId,
      type: 'follow',
      title: 'New Follower',
      message: 'started following you',
      relatedEntity: {
        entityType: 'user',
        entityId: followerUserId
      },
      priority: 'medium'
    });
  }

  /**
   * Send achievement notification
   */
  async notifyAchievement(userId, achievementTitle, achievementDescription) {
    return this.createNotification({
      recipientId: userId,
      senderId: userId, // System notification
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You earned the "${achievementTitle}" badge! ${achievementDescription}`,
      relatedEntity: {
        entityType: 'achievement',
        entityId: null
      },
      metadata: {
        achievementTitle,
        achievementDescription
      },
      priority: 'high'
    });
  }

  /**
   * Send contest-related notifications
   */
  async notifyContestUpdate(userIds, title, message, contestId = null) {
    const notifications = userIds.map(userId => 
      this.createNotification({
        recipientId: userId,
        senderId: null, // System notification
        type: 'contest_update',
        title,
        message,
        relatedEntity: contestId ? {
          entityType: 'contest',
          entityId: contestId
        } : null,
        priority: 'high'
      })
    );

    return Promise.all(notifications);
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId, { page = 1, limit = 20, unreadOnly = false, type = null } = {}) {
    const query = { recipient: userId };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('sender', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification.markAsRead();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    return Notification.markAllAsRead(userId);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return Notification.getUnreadCount(userId);
  }

  /**
   * Setup cleanup job for old notifications
   */
  setupCleanupJob() {
    // Run cleanup every 24 hours
    setInterval(async () => {
      try {
        const result = await Notification.deleteOldNotifications(30); // Delete notifications older than 30 days
        if (result.deletedCount > 0) {
          console.log(`Cleaned up ${result.deletedCount} old notifications`);
        }
      } catch (error) {
        console.error('Error during notification cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Debug method to get current SSE client status
   */
  getSSEClientStatus() {
    const status = {
      totalUsers: this.sseClients.size,
      users: []
    };

    this.sseClients.forEach((clients, userId) => {
      status.users.push({
        userId,
        clientCount: clients.size,
        clients: Array.from(clients).map(client => ({
          id: client.id,
          connected: true // Assume connected if in the map
        }))
      });
    });

    return status;
  }

  /**
   * Send heartbeat to keep SSE connections alive
   */
  sendHeartbeat() {
    console.log(`Sending heartbeat to ${this.sseClients.size} users`);
    
    this.sseClients.forEach((clients, userId) => {
      console.log(`Sending heartbeat to ${clients.size} clients for user ${userId}`);
      
      clients.forEach(client => {
        try {
          client.response.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          console.error(`Error sending heartbeat to client ${client.id}:`, error);
          clients.delete(client);
        }
      });

      // Clean up if no clients left
      if (clients.size === 0) {
        this.sseClients.delete(userId);
        console.log(`Cleaned up empty client list for user ${userId} during heartbeat`);
      }
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Setup heartbeat interval
setInterval(() => {
  notificationService.sendHeartbeat();
}, 30000); // Every 30 seconds

module.exports = notificationService;
