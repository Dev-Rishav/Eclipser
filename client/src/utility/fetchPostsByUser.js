import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiError } from "../config/api.js";

export const fetchPostsByUser = async (userId) => {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.POSTS.BY_USER(userId));
    return res.data; // Return the posts directly
  } catch (error) {
    apiError("Error fetching posts by user:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch posts by user"
    );
  }
};