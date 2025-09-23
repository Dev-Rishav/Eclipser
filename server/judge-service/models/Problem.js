const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
    default: ''
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  constraints: {
    type: String,
    maxlength: 1000
  },
  inputFormat: {
    type: String,
    maxlength: 1000
  },
  outputFormat: {
    type: String,
    maxlength: 1000
  },
  sampleInput: {
    type: String,
    maxlength: 1000
  },
  sampleOutput: {
    type: String,
    maxlength: 1000
  },
  explanation: {
    type: String,
    maxlength: 2000
  },
  testCases: {
    type: [testCaseSchema],
    required: true,
    validate: {
      validator: function(testCases) {
        return testCases && testCases.length > 0;
      },
      message: 'At least one test case is required'
    }
  },
  timeLimit: {
    type: Number,
    default: 2, // seconds
    min: 0.1,
    max: 10
  },
  memoryLimit: {
    type: Number,
    default: 128, // MB
    min: 16,
    max: 512
  },
  supportedLanguages: [{
    type: String,
    enum: ['javascript', 'java'],
    required: true
  }],
  totalPoints: {
    type: Number,
    default: 0
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

// Pre-save middleware to calculate total points
problemSchema.pre('save', function(next) {
  if (this.testCases && this.testCases.length > 0) {
    this.totalPoints = this.testCases.reduce((total, testCase) => total + testCase.points, 0);
  }
  next();
});

// Index for efficient queries
problemSchema.index({ difficulty: 1, isActive: 1 });
problemSchema.index({ tags: 1, isActive: 1 });
problemSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Problem', problemSchema);
