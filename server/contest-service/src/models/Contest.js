const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  users: [String],
  problemId: String,
  startTime: Date,
  endTime: Date,
  status: String, // pending, running, finished
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  winner: String,
});

module.exports = mongoose.model('Contest', contestSchema);
