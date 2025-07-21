const User = require("../models/User");
const Post = require("../models/Post");

/**
 * Fetches users and posts from the database based on a search query.
 * @param {string} searchQuery - The term to search for.
 * @returns {Promise<object>} - A promise that resolves to an object containing users and posts.
 */
const fetchFromDatabase = async (searchQuery) => {
  try {
    const regex = new RegExp(searchQuery, 'i');

    // Run queries concurrently for better performance
    const [users, posts] = await Promise.all([
      User.find({ username: regex }).select("username profilePic").limit(5),
      Post.find({ title: regex }).select("title author").limit(5),
    ]);

    // Format the results into the desired structure
    const formattedResults = {
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        avatar: user.profilePic, // Map 'profilePic' to 'avatar' for the frontend
      })),
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        authorName: post.author.username, // Access the embedded author username
      })),
    };

    return formattedResults;
  } catch (error) {
    console.error("Error in search service while fetching from DB:", error);
    // Re-throw the error to be caught by the controller
    throw new Error("Database query failed during search.");
  }
};

module.exports = {
  fetchFromDatabase,
};