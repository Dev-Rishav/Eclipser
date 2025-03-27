const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postType: {
      type: String,
      enum: ["query", "discussion", "achievement"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String },
    codeSnippet: {
      language: { type: String }, // Example: "javascript", "python"
      code: { type: String }, // Actual code snippet
    },
    tags: [{ type: String }],
    likes: [{ userId: mongoose.Schema.Types.ObjectId, timestamp: Date }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);