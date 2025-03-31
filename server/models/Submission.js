const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contestId: { type: Number, required: true },
    problemId: { type: Number, required: true },
    code: { type: String, required: true },
    language: {
      type: String,
      enum: ["python", "javascript", "java"],
      required: true,
    },
    verdict: {
      status: { type: String, enum: ["AC", "WA", "TLE", "MLE", "RE"] },
      time: Number,
      memory: Number,
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
