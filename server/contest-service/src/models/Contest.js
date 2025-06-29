const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: String,
  code: String,
  language: String,
  submittedAt: Date,
  result: Object,
});

const contestSchema = new mongoose.Schema({
  users: [String],
  problemId: String,
  startTime: Date,
  endTime: Date,
  status: String, // pending, running, finished
  submissions: [submissionSchema],
  winner: String,
});

module.exports = mongoose.model('Contest', contestSchema);
