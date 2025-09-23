const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseNumber: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  input: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    default: ''
  },
  actualOutput: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0 // milliseconds
  },
  memoryUsed: {
    type: Number,
    default: 0 // KB
  },
  status: {
    id: { type: Number },
    description: { type: String }
  },
  error: {
    type: String,
    default: null
  }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  sourceCode: {
    type: String,
    required: true,
    maxlength: 50000
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'java']
  },
  languageId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'evaluating', 
      'accepted',
      'wrong_answer',
      'time_limit_exceeded',
      'memory_limit_exceeded',
      'runtime_error',
      'compilation_error',
      'internal_error'
    ],
    default: 'pending'
  },
  judge0Token: {
    type: String,
    default: null
  },
  verdict: {
    id: { type: Number },
    description: { type: String }
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTestCases: {
    type: Number,
    default: 0,
    min: 0
  },
  passedTestCases: {
    type: Number,
    default: 0,
    min: 0
  },
  failedTestCases: {
    type: Number,
    default: 0,
    min: 0
  },
  executionTime: {
    type: Number,
    default: 0 // milliseconds
  },
  memoryUsage: {
    type: Number,
    default: 0 // KB
  },
  testCaseResults: [testCaseResultSchema],
  compilationError: {
    type: String,
    default: null
  },
  runtimeError: {
    type: String,
    default: null
  },
  submissionNumber: {
    type: Number,
    default: 1
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate submission number
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model('Submission').countDocuments({
        userId: this.userId,
        contestId: this.contestId,
        problemId: this.problemId
      });
      this.submissionNumber = count + 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to update evaluation results
submissionSchema.methods.updateEvaluationResults = function(evaluationResult) {
  this.totalTestCases = evaluationResult.totalTestCases;
  this.passedTestCases = evaluationResult.passedTestCases;
  this.failedTestCases = evaluationResult.failedTestCases;
  this.score = evaluationResult.score;
  this.executionTime = Math.round(evaluationResult.totalExecutionTime * 1000); // Convert to ms
  this.memoryUsage = evaluationResult.maxMemoryUsage;
  this.testCaseResults = evaluationResult.results.map((result, index) => ({
    testCaseNumber: index + 1,
    passed: result.passed,
    input: result.input,
    expectedOutput: result.expectedOutput,
    actualOutput: result.actualOutput,
    executionTime: Math.round((result.time || 0) * 1000),
    memoryUsed: result.memory || 0,
    status: result.status,
    error: result.error
  }));

  // Determine overall status
  if (this.passedTestCases === this.totalTestCases) {
    this.status = 'accepted';
    this.isAccepted = true;
  } else if (this.passedTestCases > 0) {
    this.status = 'wrong_answer';
  } else {
    // Check if it's a compilation or runtime error
    const hasCompilationError = this.testCaseResults.some(r => 
      r.status && r.status.id === 6 // Compilation Error
    );
    const hasRuntimeError = this.testCaseResults.some(r => 
      r.status && [7, 8, 9, 10, 11, 12].includes(r.status.id) // Runtime Errors
    );
    const hasTimeLimit = this.testCaseResults.some(r => 
      r.status && r.status.id === 5 // Time Limit Exceeded
    );

    if (hasCompilationError) {
      this.status = 'compilation_error';
      this.compilationError = this.testCaseResults.find(r => 
        r.status && r.status.id === 6
      )?.error || 'Compilation failed';
    } else if (hasTimeLimit) {
      this.status = 'time_limit_exceeded';
    } else if (hasRuntimeError) {
      this.status = 'runtime_error';
      this.runtimeError = this.testCaseResults.find(r => 
        r.status && [7, 8, 9, 10, 11, 12].includes(r.status.id)
      )?.error || 'Runtime error occurred';
    } else {
      this.status = 'wrong_answer';
    }
  }
};

// Method to calculate points based on score
submissionSchema.methods.calculatePoints = function(maxPoints) {
  if (this.isAccepted) {
    this.points = maxPoints;
  } else {
    // Partial scoring based on passed test cases
    this.points = Math.round((this.passedTestCases / this.totalTestCases) * maxPoints);
  }
  return this.points;
};

// Compound indexes for efficient queries
submissionSchema.index({ userId: 1, contestId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
