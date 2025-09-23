const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  problemsSolved: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSubmissionTime: {
    type: Date,
    default: null
  }
}, { _id: false });

const contestProblemSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  order: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 30,
    max: 10080 // 7 days
  },
  problems: {
    type: [contestProblemSchema],
    required: true,
    validate: {
      validator: function(problems) {
        return problems && problems.length > 0;
      },
      message: 'At least one problem is required'
    }
  },
  contestants: [contestantSchema],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  registrationStartTime: {
    type: Date,
    default: Date.now
  },
  registrationEndTime: {
    type: Date,
    required: true
  },
  rules: {
    type: String,
    maxlength: 5000
  },
  prizes: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['upcoming', 'registration_open', 'running', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  scoringType: {
    type: String,
    enum: ['icpc', 'ioi'], // ICPC style or IOI style
    default: 'icpc'
  },
  allowedLanguages: [{
    type: String,
    enum: ['javascript', 'java'],
    required: true
  }],
  totalSubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual to get current contest status
contestSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (now < this.registrationStartTime) {
    return 'not_open';
  } else if (now >= this.registrationStartTime && now < this.registrationEndTime && now < this.startTime) {
    return 'registration_open';
  } else if (now >= this.startTime && now < this.endTime) {
    return 'running';
  } else if (now >= this.endTime) {
    return 'completed';
  } else {
    return 'upcoming';
  }
});

// Method to check if user can register
contestSchema.methods.canRegister = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.registrationStartTime &&
    now < this.registrationEndTime &&
    now < this.startTime &&
    (this.maxParticipants === null || this.contestants.length < this.maxParticipants)
  );
};

// Method to check if contest is active
contestSchema.methods.isContestActive = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startTime &&
    now < this.endTime
  );
};

// Method to add contestant
contestSchema.methods.addContestant = function(userId, username) {
  if (!this.canRegister()) {
    throw new Error('Registration is not open for this contest');
  }
  
  const existingContestant = this.contestants.find(c => c.userId === userId);
  if (existingContestant) {
    throw new Error('User is already registered for this contest');
  }
  
  this.contestants.push({
    userId,
    username,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Method to update contestant score
contestSchema.methods.updateContestantScore = function(userId, newScore, problemsSolved) {
  const contestant = this.contestants.find(c => c.userId === userId);
  if (!contestant) {
    throw new Error('Contestant not found');
  }
  
  contestant.score = newScore;
  contestant.problemsSolved = problemsSolved;
  contestant.lastSubmissionTime = new Date();
  
  // Recalculate ranks
  this.updateRanks();
  
  return this.save();
};

// Method to update ranks
contestSchema.methods.updateRanks = function() {
  // Sort contestants by score (descending), then by problems solved (descending), then by last submission time (ascending)
  const sortedContestants = this.contestants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
    if (a.lastSubmissionTime && b.lastSubmissionTime) {
      return a.lastSubmissionTime - b.lastSubmissionTime;
    }
    return 0;
  });
  
  // Update ranks
  sortedContestants.forEach((contestant, index) => {
    contestant.rank = index + 1;
  });
};

// Indexes for efficient queries
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ createdBy: 1 });
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ 'contestants.userId': 1 });

module.exports = mongoose.model('Contest', contestSchema);
