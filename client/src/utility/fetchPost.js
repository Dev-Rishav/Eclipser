import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

export const fetchPostsByTags = async (tags = [], page = 1, limit = 10) => {
  apiLog("🔄 Fetching Posts");

  try {
    apiLog("🛠 Fetching from Backend");
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.BY_TAGS, {
      tags,
      page,
      limit,
    });

    localStorage.setItem("cachedPosts", JSON.stringify(response.data)); // Store in cache
    return response.data;
  } catch (error) {
    apiError("❌ Error fetching posts:", error);
    return [];
  }
};

export const fetchRemainingPosts = async (tags = [], page = 1, limit = 10) => {
  apiLog("🔄 Fetching Remaining Posts");

  try {
    apiLog("🛠 Fetching from Backend");
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.REMAINING, {
      tags,
      page,
      limit,
    });

    localStorage.setItem("cachedRemainingPosts", JSON.stringify(response.data)); // Store in cache
    return response.data;
  } catch (error) {
    apiError("❌ Error fetching remaining posts:", error);
    return [];
  }
};
