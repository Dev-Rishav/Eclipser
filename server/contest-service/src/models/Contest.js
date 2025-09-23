const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  users: [String],
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  // Keep problemId for backward compatibility
  problemId: String,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'finished', 'cancelled'],
    default: 'pending'
  },
  submissions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Submission' 
  }],
  winner: {
    userId: String,
    score: Number,
    submissionTime: Date
  },
  leaderboard: [{
    userId: String,
    username: String,
    score: Number,
    totalSubmissions: Number,
    lastSubmissionTime: Date,
    bestSubmissionTime: Number, // execution time of best submission
    rank: Number
  }],
  maxParticipants: {
    type: Number,
    default: 100
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  rules: {
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    submissionLimit: {
      type: Number,
      default: 50 // Max submissions per user
    },
    penaltyPerWrongSubmission: {
      type: Number,
      default: 0 // Points deducted for wrong submissions
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
contestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for performance
contestSchema.index({ status: 1 });
contestSchema.index({ startTime: 1 });
contestSchema.index({ createdBy: 1 });
contestSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Contest', contestSchema);
