const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: true // Hidden test cases for evaluation
  },
  weight: {
    type: Number,
    default: 1 // Weight for scoring
  },
  timeLimit: {
    type: Number,
    default: 1000 // Time limit in milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // Memory limit in MB
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeLimit: {
    type: Number,
    default: 1000 // Default time limit in milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // Default memory limit in MB
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  hints: [String],
  testCases: [testCaseSchema],
  tags: [String],
  createdBy: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  supportedLanguages: {
    type: [String],
    default: ['python', 'javascript', 'java', 'cpp', 'c']
  },
  starterCode: {
    python: String,
    javascript: String,
    java: String,
    cpp: String,
    c: String
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
problemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search optimization
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Problem', problemSchema);
