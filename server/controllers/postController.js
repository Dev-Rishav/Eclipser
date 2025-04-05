const Post = require("../models/Post");
const sanitizeHtml = require("sanitize-html");
const client = require("../configs/redis");
const {getIo}=require("../configs/socket");


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


//  Create a New Post & Update Redis Cache
exports.createPost = async (req, res) => {
  try {
    const io=getIo();
    const { title, content, postType, tags, attachments,codeSnippet } = req.body;

    const sanitizedContent = sanitizeInput(content);
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedCodeSnippet = codeSnippet ? sanitizeCodeSnippet(codeSnippet.code) : null;

    const newPost = new Post({
      author:{
        userId:req.user.id,
        username:req.user.username,
        profilePic:req.user.profilePic,
      },
      postType,
      title: sanitizedTitle,
      content: sanitizedContent,
      tags,
      attachments,
      codeSnippet: codeSnippet ? { language: codeSnippet.language, code: sanitizedCodeSnippet } : null,
    });

    //Save new post to MongoDB
    await newPost.save();

    //  Fetch cached posts from Redis
    const cachedPosts = await client.get("allPosts");

    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);

      //  Add new post to cache (prepend to keep latest posts first)
      postsArray.unshift(newPost);

      // Emit event to WebSocket clients
      io.emit("newPost", newPost);

      // Update Redis cache with new post
      await client.setEx("allPosts", 3600, JSON.stringify(postsArray));
    } else {
      // If cache doesn't exist, create new cache
      await client.setEx("allPosts", 3600, JSON.stringify([newPost]));
    }

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Remaining Posts (POST)
exports.getAllRemainingPosts = async (req, res) => {
  try {
    const { tags = [], page = 1, limit = 10 } = req.body;

    // Cache key based on tags and page
    const cacheKey = `remainingPosts:${tags.join(",")}:${page}`;
    const cachedPosts = await client.get(cacheKey);

    if (cachedPosts) {
      console.log("♻️ Serving Remaining Posts from Cache");
      return res.json(JSON.parse(cachedPosts)); // Return cached data
    }

    console.log("🛠 Fetching Remaining Posts from Database");
    // Fetch posts not matching the subscribed tags
    const posts = await Post.find({ tags: { $nin: tags } })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);

    // Store fetched data in Redis for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(posts));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Posts by Tags (POST)
exports.getAllPostsByTags = async (req, res) => {
  try {
    const { tags = [], page = 1, limit = 10 } = req.body;

    // Cache key based on tags and page
    const cacheKey = `postsByTags:${tags.join(",")}:${page}`;
    const cachedPosts = await client.get(cacheKey);

    if (cachedPosts) {
      console.log("♻️ Serving Posts by Tags from Cache");
      return res.json(JSON.parse(cachedPosts)); // Return cached data
    }

    console.log("🛠 Fetching Posts by Tags from Database");
    // Fetch posts matching the subscribed tags
    const posts = await Post.find({ tags: { $in: tags } })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);

    // Store fetched data in Redis for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(posts));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Get Posts by User
exports.getPostsByUser = async (req, res) => {
  try {
    const cacheKey = `userPosts:${req.params.userId}`;
    const cachedUserPosts = await client.get(cacheKey);

    if (cachedUserPosts) {
      console.log("♻️ Serving from Cache");
      return res.json(JSON.parse(cachedUserPosts));
    }

    //!userId is in user
    const posts = await Post.find({ "author.userId" : req.params.userId });
    if (posts?.length === 0) return res.status(404).json({ message: "Post not found" });

    await client.setEx(cacheKey, 3600, JSON.stringify(posts));

    console.log("🛠 Fetching from Database");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user posts", error });
  }
};

// Get Posts by Type (query, discussion, achievement)
exports.getPostsByType = async (req, res) => {
  try {
    const cacheKey = `postType:${req.params.type}`;
    const cachedPosts = await client.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({ postType: req.params.type });

    await client.setEx(cacheKey, 3600, JSON.stringify(posts));

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

//? SSE (Server-Sent Events) for real-time updates on likes comments and views


// SSE Clients storage
let clients = [];

// Helper function to broadcast updates to connected clients
const broadcastUpdate = (data) => {
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
};

// Register SSE endpoint to receive updates
exports.streamUpdates = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Use your frontend URL
  res.setHeader("Access-Control-Allow-Credentials", "true");

  console.log("New SSE connection established");
  
  // Add client to the list
  const clientId = Date.now();
  clients.push({ id: clientId, res });

  // Send initial connection success message
  res.write(`data: ${JSON.stringify({ message: "Connection established" })}\n\n`);

    // Periodically send a heartbeat to keep the connection alive
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ message: "heartbeat" })}\n\n`);
    }, 60000); // Every 60 seconds

  // Remove client on connection close
  req.on("close", () => {
    console.log("SSE connection closed");
    clearInterval(heartbeat);
    clients = clients.filter((client) => client.id !== clientId);
  });
};

// Like a Post & Update Redis Cache
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some(
      (like) => like.userId.toString() === req.user.id
    );
    if (alreadyLiked)
      return res.status(400).json({ message: "You already liked this post" });

    post.likes.push({ userId: req.user.id });
    await post.save();

    // Update Redis cache for all posts
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.map((p) =>
        p._id === post.id ? post : p
      );
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    // Broadcast like event via SSE
    broadcastUpdate({
      type: "like",
      postId: post._id,
      userId: req.user.id,
      username: req.user.username,
    });

    res.status(200).json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Error liking post", error });
  }
};

// Comment on a Post & Update Redis
exports.commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      userId: req.user.id,
      content,
      timestamp: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Update Redis cache for all posts
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts);
      const updatedPosts = postsArray.map((p) =>
        p._id === post.id ? post : p
      );
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    // Broadcast comment event via SSE
    broadcastUpdate({
      type: "comment",
      postId: post._id,
      content: content,
      author: {
        userId: req.user.id,
        username: req.user.username,
        profilePic: req.user.profilePic,
      },
      dateTime: new Date(),
    });

    res.status(201).json({
      postId: post._id,
      content,
      author: {
        userId: req.user.id,
        username: req.user.username,
        profilePic: req.user.profilePic,
      },
      dateTime: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};


//  Increase View Count & Update Redis
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
      const updatedPosts = postsArray.map((p) =>
        p._id === post.id ? post : p
      );
      await client.setEx("allPosts", 3600, JSON.stringify(updatedPosts));
    }

    res.status(200).json({ message: "View count updated", views: post.views });
  } catch (error) {
    res.status(500).json({ message: "Error updating views", error });
  }
};

// Delete a Post & Update Redis
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();

    // Update Redis cache
    const cachedPosts = await client.get("allPosts");
    if (cachedPosts) {
      const postsArray = JSON.parse(cachedPosts).filter(
        (p) => p._id !== post.id
      );
      await client.setEx("allPosts", 3600, JSON.stringify(postsArray));
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
