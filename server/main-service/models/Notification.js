const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who will receive this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Who triggered this notification
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type of notification
  type: {
    type: String,
    enum: [
      'like',           // Someone liked your post
      'comment',        // Someone commented on your post
      'follow',         // Someone followed you
      'post_mention',   // Someone mentioned you in a post
      'comment_mention',// Someone mentioned you in a comment
      'achievement',    // You earned an achievement/badge
      'contest_update', // Contest-related updates
      'system'          // System notifications
    ],
    required: true,
    index: true
  },
  
  // Title of the notification
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Icon/emoji for the notification
  icon: {
    type: String,
    default: '🔔'
  },
  
  // Related entities (post, comment, etc.)
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['post', 'comment', 'user', 'contest', 'achievement'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.entityType'
    }
  },
  
  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Notification status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Delivery status for different channels
  deliveryStatus: {
    realtime: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // When to delete this notification (optional)
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
  
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, priority: 1, createdAt: -1 });

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

notificationSchema.methods.markAsDelivered = function(channel) {
  if (this.deliveryStatus[channel] !== undefined) {
    this.deliveryStatus[channel] = true;
    return this.save();
  }
  throw new Error(`Invalid delivery channel: ${channel}`);
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

notificationSchema.statics.getRecentNotifications = function(userId, limit = 20) {
  return this.find({ recipient: userId })
    .populate('sender', 'username profilePic')
    .sort({ createdAt: -1 })
    .limit(limit);
};

notificationSchema.statics.deleteOldNotifications = function(olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
