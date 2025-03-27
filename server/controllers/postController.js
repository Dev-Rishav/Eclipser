const Post = require("../models/Post");
const sanitizeHtml = require("sanitize-html");
const client = require("../configs/redis");

// Function to sanitize user inputs (XSS Protection)
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
  });
};

// Function to sanitize code snippets (allowing <pre> and <code> for formatting)
const sanitizeCodeSnippet = (code) => {
  return sanitizeHtml(code, {
    allowedTags: ["pre", "code"], // Allowing only these tags
    allowedAttributes: {},
  });
};

// Create a New Post
exports.createPost = async (req, res) => {
  try {
    const { title, content, postType, tags, attachments, codeSnippet } = req.body;

    const sanitizedContent = sanitizeInput(content);
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedCodeSnippet = codeSnippet ? sanitizeCodeSnippet(codeSnippet.code) : null;

    const newPost = new Post({
      userId: req.user.id,
      postType,
      title: sanitizedTitle,
      content: sanitizedContent,
      tags,
      attachments,
      codeSnippet: codeSnippet ? { language: codeSnippet.language, code: sanitizedCodeSnippet } : null,
    });

    await newPost.save();

    // Update Redis cache with the new post
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      postsArray.unshift(newPost);
      await client.setEx("allPosts", 3600, JSON.stringify(postsArray));
    } else {
      await client.setEx("allPosts", 3600, JSON.stringify([newPost]));
    }

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const cachedPosts = await client.get("allPosts");

    if (cachedPosts) {
      console.log("Serving from cache");
      return res.json(JSON.parse(cachedPosts));
    }

    console.log("Fetching from database");
    const posts = await Post.find().sort({ createdAt: -1 });

    await client.setEx("allPosts", 3600, JSON.stringify(posts));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get a Single Post
exports.getPostById = async (req, res) => {
  try {
    const cacheKey = `post:${req.params.id}`;
    const cachedPost = await client.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await client.setEx(cacheKey, 3600, JSON.stringify(post));

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
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

    // Update Redis cache
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.map(p => (p._id === post.id ? post : p));
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

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

    // Update Redis cache
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.map(p => (p._id === post.id ? post : p));
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    res.status(201).json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};

// Increase View Count
exports.increaseViewCount = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    // Update Redis cache
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.map(p => (p._id === post.id ? post : p));
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    res.status(200).json({ message: "View count updated", views: post.views });
  } catch (error) {
    res.status(500).json({ message: "Error updating views", error });
  }
};

// Delete a Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();

    // Update Redis cache
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.filter(p => p._id !== post.id);
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
