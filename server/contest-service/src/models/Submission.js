const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: String,
  code: String,
  language: String,
  submittedAt: Date,
  result: Object,
});

module.exports = mongoose.model('Submission', submissionSchema);
