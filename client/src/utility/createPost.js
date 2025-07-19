import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

/**
 * Utility function to create a new post
 * @param {Object} post - The post data to be created
 * @param {string} post.title - Post title
 * @param {string} post.content - Post content
 * @param {string} post.postType - Post type (query, discussion, achievement)
 * @param {string[]} post.tags - Array of tags
 * @param {Object} [post.codeSnippet] - Optional code snippet
 * @param {string} post.codeSnippet.language - Programming language
 * @param {string} post.codeSnippet.code - Code content
 * @returns {Promise<Object>} - The created post data
 * @throws {Error} - Throws an error if the request fails
 */
export const createPost = async (post) => {
  // console.log("HHit createPost!!!!!!!!!!!!!!!!!!!!");

  try {
    // Validate required fields
    if (!post.title?.trim()) {
      throw new Error('Post title is required');
    }
    
    if (!post.content?.trim()) {
      throw new Error('Post content is required');
    }
    
    if (!post.postType) {
      throw new Error('Post type is required');
    }
    
    if (!Array.isArray(post.tags) || post.tags.length === 0) {
      throw new Error('At least one tag is required');
    }

    // Prepare the post data according to backend schema
    const postData = {
      title: post.title.trim(),
      content: post.content.trim(),
      postType: post.postType,
      tags: post.tags.filter(tag => tag.trim()), // Remove empty tags
      ...(post.codeSnippet && {
        codeSnippet: {
          language: post.codeSnippet.language,
          code: post.codeSnippet.code
        }
      })
    };

    apiLog("Creating post:", postData);
    
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.BASE, postData);
    
    apiLog("Post created successfully:", response.data);
    return response.data; // Return the created post
  } catch (error) {
    apiError("Error creating post:", error);
    
    // Provide more specific error messages
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || 'Invalid post data';
      throw new Error(message);
    } else if (error.response?.status === 401) {
      throw new Error('You must be logged in to create a post');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to create posts');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error; // Re-throw the error to handle it in the calling function
  }
};