const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: mongoose.Schema.Types.ObjectId,
  input: String,
  expectedOutput: String,
  actualOutput: String,
  status: {
    type: String,
    enum: ['passed', 'failed', 'timeout', 'error', 'memory_exceeded']
  },
  executionTime: Number, // in milliseconds
  memoryUsed: Number, // in MB
  errorMessage: String
});

const submissionSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  username: String, // For display purposes
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'javascript', 'java', 'cpp', 'c']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'timeout'],
    default: 'pending'
  },
  result: {
    overallStatus: {
      type: String,
      enum: ['pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
      default: 'pending'
    },
    score: {
      type: Number,
      default: 0
    },
    totalTestCases: {
      type: Number,
      default: 0
    },
    passedTestCases: {
      type: Number,
      default: 0
    },
    executionTime: Number, // Best execution time in milliseconds
    memoryUsed: Number, // Peak memory usage in MB
    compilationError: String,
    runtimeError: String,
    testCaseResults: [testCaseResultSchema]
  },
  dockerContainerId: String, // For tracking Docker execution
  judgeTime: Date, // When the submission was judged
  processingTime: Number // Total time taken for processing in milliseconds
});

// Index for performance
submissionSchema.index({ contestId: 1, userId: 1 });
submissionSchema.index({ problemId: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ 'result.overallStatus': 1 });

module.exports = mongoose.model('Submission', submissionSchema);
