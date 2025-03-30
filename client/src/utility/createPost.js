import axios from "axios";

/**
 * Utility function to create a new post
 * @param {Object} post - The post data to be created
 * @returns {Promise<Object>} - The created post data
 * @throws {Error} - Throws an error if the request fails
 */
export const createPost = async (post) => {
  try {
    const newPost={...post, tags: post.tags.split(",").map((tag) => tag.trim())};
    console.log("Creating post:", newPost);
    
    const response = await axios.post("http://localhost:3000/api/posts", newPost, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data; // Return the created post
  } catch (error) {
    console.error("Error creating post:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};