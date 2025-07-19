const Post = require("../models/Post");
const sanitizeHtml = require("sanitize-html");
const client = require("../configs/redis");
const { getIo } = require("../configs/socket");
const { postObjectFlattener } = require("../utils/postObjectFlattener");
const notificationService = require("../services/notificationService");

//! Took: 18hours to implement the redis cache and denormalization, dont touch this code you have wasted a lot of time on this
//TODO: in redis cache, its making temp:taggedPosts which temporaily holds the postIds that is to be retrieved, and is deleted after the request is completed. What if two users tries to fetch at the same time and same object is overridden, so use a unique key for each request or implement a locking mechanism

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

//  Create a New Post & Update Redis Cache with Set-Based + Denormalization Data Modeling
exports.createPost = async (req, res) => {
  try {
    const io = getIo();
    const {
      title,
      content,
      postType,
      tags = [],
      attachments = [],
      codeSnippet,
    } = req.body;

    // Basic validation
    if (!title || !content || !postType) {
      return res
        .status(400)
        .json({ message: "Title, content, and postType are required." });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags must be an array." });
    }

    const sanitizedContent = sanitizeInput(content);
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedCodeSnippet = codeSnippet
      ? sanitizeCodeSnippet(codeSnippet.code)
      : null;

    const postPayload = {
      author: {
        userId: req.user.id,
        username: req.user.username,
        profilePic: req.user.profilePic,
      },
      postType,
      title: sanitizedTitle,
      content: sanitizedContent,
      tags,
      attachments,
      codeSnippet: codeSnippet
        ? {
            language: codeSnippet.language,
            code: sanitizedCodeSnippet,
          }
        : null,
    };

    //Save new post to MongoDB
    const newPost = new Post(postPayload);
    const savedPost = await newPost.save();
    // console.log("Post saved to MongoDB:", savedPost);
    

    //* using Set-Based + Denormalization Data Modeling in Redis

    // Flattened object for Redis hash
    const flatPost = postObjectFlattener(savedPost);
    // console.log("Flat Post for Redis:", flatPost);

    try {
      const timestamp = new Date(savedPost.createdAt).getTime();
      const postId = savedPost._id.toString();

      // Save the new post as a Redis hash
      await client.hSet(`post:${postId}`, flatPost);

      // Add post ID to global sorted set with timestamp as score
      await client.zAdd("allPostIDsSorted", {
        score: new Date(savedPost.createdAt).getTime(),
        value: savedPost._id.toString(),
      });

      // Add post ID to each tag's sorted set (to preserve order within tags too)
      for (const tag of savedPost.tags) {
        await client.zAdd(`tag:${tag}:sorted`, {
          score: timestamp,
          value: postId,
        });
      }
    } catch (error) {
      console.error("Error saving post to Redis:", error);
      return res.status(500).json({ message: "Server Error", error });
    }

    //emit event to WebSocket clients
    io.emit("newPost", savedPost);

    return res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Remaining Posts (POST)
exports.getAllRemainingPosts = async (req, res) => {
  try {
    const { tags = [], page = 1, limit = 10 } = req.body;

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let excludedIds = [];

    // Collect excluded post IDs (based on subscribed tags)
    if (tags.length) {
      const tagSortedKeys = tags.map((tag) => `tag:${tag}:sorted`);
      await client.zUnionStore(
        "temp:excluded:postIDs",
        tagSortedKeys
      );

      excludedIds = await client.zRange("temp:excluded:postIDs", 0, -1);
      // console.log("excludedIds", excludedIds);
      
    }

    // Get all post IDs sorted (from latest to oldest)
    const allPostIDs = await client.zRange("allPostIDsSorted", 0, -1,{REV: true});

    // Filter out excluded IDs (if any)
    const remainingPostIDs = excludedIds.length
      ? allPostIDs.filter((id) => !excludedIds.includes(id))
      : allPostIDs;

      // console.log("remainingPostIDs", remainingPostIDs);
      

    // Apply pagination
    const paginatedIds = remainingPostIDs.slice(start, end + 1);

    // Fetch corresponding posts from Redis hash
    const pipeline = client.multi();
    paginatedIds.forEach((postId) => pipeline.hGetAll(`post:${postId}`));
    const results = await pipeline.exec();
    // console.log("results", results);

    // Flatten results -> Mongoose model
    const cachedPosts = results
      .map((post) => {
        if (!post || Object.keys(post).length === 0) return null;
        return {
          _id: post._id,
          author: {
            userId: post.userId,
            username: post.username,
            profilePic: post.profilePic,
          },
          postType: post.postType,
          title: post.title,
          content: post.content,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          likes: post.likes ? JSON.parse(post.likes) : [],
          comments: post.comments ? JSON.parse(post.comments) : [],
          views: post.views ? JSON.parse(post.views) : 0,
          tags: JSON.parse(post.tags || "[]"),
          attachments: JSON.parse(post.attachments || "[]"),
          codeSnippet: post.codeSnippet ? JSON.parse(post.codeSnippet) : null,
        };
      })
      .filter(Boolean); // Remove nulls

    console.log("cachedPosts", cachedPosts.length);

    if (cachedPosts.length !== 0) {
      console.log("♻️ Serving Remaining Posts from Cache");
      return res.json(cachedPosts); // Return cached data
    }

    console.log("🛠 Fetching Remaining Posts from Database");
    // Fetch posts not matching the subscribed tags
    const posts = await Post.find({ tags: { $nin: tags } })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);

    // Store fetched data in Redis for 1 hour
    // await client.setEx(cacheKey, 3600, JSON.stringify(posts));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get All Posts by Tags (POST)
exports.getAllPostsByTags = async (req, res) => {
  try {
    const { tags = [], page = 1, limit = 10 } = req.body;

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Map tags to their corresponding ZSET keys
    const tagSortedKeys = tags.map((tag) => `tag:${tag}:sorted`);
    // console.log("tagKeys", tagSortedKeys, "page", page, "limit", limit);

    // Merge ZSETs into a temporary key (union of all relevant tag-based posts)
    await client.zUnionStore("temp:taggedPosts", tagSortedKeys, {
      AGGREGATE: "MAX",
      WEIGHTS: tagSortedKeys.map(() => 1),
    });

    // Get sorted post IDs directly from Redis using pagination
    const postIds = await client.zRange("temp:taggedPosts", start, end, {
      REV: true,
    });
    // console.log("postIds", postIds);

    // Use pipeline to fetch actual post content
    const pipeline = client.multi();
    postIds.forEach((postId) => pipeline.hGetAll(`post:${postId}`));
    const results = await pipeline.exec();

    // console.log("flattenPosts", results);

    // Flatten results -> Mongoose model
    const cachedPosts = results
      .map((post) => {
        if (!post || Object.keys(post).length === 0) return null;
        return {
          _id: post._id,
          author: {
            userId: post.userId,
            username: post.username,
            profilePic: post.profilePic,
          },
          postType: post.postType,
          title: post.title,
          content: post.content,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          likes: post.likes ? JSON.parse(post.likes) : [],
          comments: post.comments ? JSON.parse(post.comments) : [],
          views: post.views ? JSON.parse(post.views) : 0,
          tags: JSON.parse(post.tags || "[]"),
          attachments: JSON.parse(post.attachments || "[]"),
          codeSnippet: post.codeSnippet ? JSON.parse(post.codeSnippet) : null,
        };
      })
      .filter(Boolean); // Remove nulls

    if (cachedPosts.length > 0) {
      console.log("♻️ Serving Posts by Tags from Cache");
      return res.status(200).json(cachedPosts); // Return cached data
    }
    //! after exhausting the cache, it is fetching from database, which is redundant, need to pass a flag to stop sending requests if page>1 and cache is empty

    console.log("🛠 Fetching Posts by Tags from Database");
    // Fetch posts matching the subscribed tags
    const posts = await Post.find({ tags: { $in: tags } })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by tags:", error);
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
    const posts = await Post.find({ "author.userId": req.params.userId });
    if (posts?.length === 0)
      return res.status(404).json({ message: "Post not found" });

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
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  console.log("New SSE connection established");

  // Add client to the list
  const clientId = Date.now();
  clients.push({ id: clientId, res });

  // Send initial connection success message
  res.write(
    `data: ${JSON.stringify({ message: "Connection established" })}\n\n`
  );

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

    const userPayload= {
      userId: req.user.id,
      username: req.user.username,
      profilePic: req.user.profilePic,
      dateTime: new Date(),
    };

    post.likes.push(userPayload);
    await post.save();

    // Update Redis cache for the particular post
    try{
    const cachedPost = await client.hGetAll(`post:${post._id}`);
    if(!cachedPost) return res.status(404).json({ message: "Post not found in cache" });

    const currentLikes=cachedPost.likes ? JSON.parse(cachedPost.likes) : [];
    currentLikes.push(userPayload);
    // console.log("currentLikes", currentLikes);
    

    await client.hSet(`post:${post._id}`, {
      ...cachedPost,
      likes: JSON.stringify(currentLikes),
    });
  }catch(error){
    console.error("Error updating Redis cache for likes:", error);
    return res.status(500).json({ message: "Error writing likes in redis", error });
  }


    // Send notification to post author
    try {
      await notificationService.notifyPostLike(
        post.author.userId,
        req.user.id,
        post._id,
        post.title
      );
    } catch (notificationError) {
      console.error("Error sending like notification:", notificationError);
      // Don't fail the like operation if notification fails
    }

    // Broadcast like event via SSE (legacy support)
    broadcastUpdate({
      type: "like",
      postId: post._id,
      ...userPayload,
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
    // Update Redis cache for the particular post
    try {
      const cachedPost = await client.hGetAll(`post:${post._id}`);
      if (!cachedPost) return res.status(404).json({ message: "Post not found in cache" });


      const currentComments = cachedPost.comments
        ? JSON.parse(cachedPost.comments)
        : [];
      currentComments.push(newComment);

      await client.hSet(`post:${post._id}`, {
        ...cachedPost,
        comments: JSON.stringify(currentComments),
      });

    } catch (error) {
      console.error("Error updating Redis cache for comments:", error);
      return res.status(500).json({ message: "Error writing comments in redis", error });
    }

    // Send notification to post author
    try {
      await notificationService.notifyPostComment(
        post.author.userId,
        req.user.id,
        post._id,
        post.title,
        content
      );
    } catch (notificationError) {
      console.error("Error sending comment notification:", notificationError);
      // Don't fail the comment operation if notification fails
    }

    // Broadcast comment event via SSE (legacy support)
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


//fetch tags stats
exports.getTagStats = async (req, res) => {
  try {
    const tagStats = await client.get("tagStats");
    if (!tagStats) return res.status(404).json({ message: "No tag stats found" });

    res.status(200).json(JSON.parse(tagStats));
  } catch (error) {
    res.status(500).json({ message: "Error fetching tag stats", error });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find post by ID and populate comment authors (author info is already embedded in post)
    const post = await Post.findById(id)
      .populate("comments.userId", "name username profilePicture");
      
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Optionally increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching post", 
      error: error.message 
    });
  }
};

