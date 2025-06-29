const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  seen: { type: Boolean, default: false }
}, { timestamps: true });


// Indexes for performance
messageSchema.index({ senderId: 1, receiverId: 1, sentAt: -1 }); // Fetch messages sorted by time
messageSchema.index({ receiverId: 1, seen: 1 });                  // Unseen messages
messageSchema.index({ sentAt: -1 });                              // Sorting for global messages (if needed)


module.exports = mongoose.model('Message', messageSchema);
