import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

/**
 * Utility function to create a new post
 * @param {Object} post - The post data to be created
 * @returns {Promise<Object>} - The created post data
 * @throws {Error} - Throws an error if the request fails
 */
export const createPost = async (post) => {
  try {
    const newPost = { ...post, tags: post.tags.split(",").map((tag) => tag.trim()) };
    apiLog("Creating post:", newPost);
    
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.BASE, newPost);
    return response.data; // Return the created post
  } catch (error) {
    apiError("Error creating post:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};