const Post = require('../models/Post');

// Create a Post
exports.createPost = async (req, res) => {
  try {
    const { postType, title, content, tags, attachments } = req.body;
    const newPost = new Post({ userId: req.user.id, postType, title, content, tags, attachments });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "username email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// Get Posts by User
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user posts", error });
  }
};

// Get Posts by Type (query, discussion, achievement)
exports.getPostsByType = async (req, res) => {
  try {
    const posts = await Post.find({ postType: req.params.type });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// Like a Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some(like => like.userId.toString() === req.user.id);
    if (alreadyLiked) return res.status(400).json({ message: "You already liked this post" });

    post.likes.push({ userId: req.user.id });
    await post.save();
    res.status(200).json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Error liking post", error });
  }
};

// Comment on a Post
exports.commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId: req.user.id, content });
    await post.save();
    res.status(201).json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};

// Delete a Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
