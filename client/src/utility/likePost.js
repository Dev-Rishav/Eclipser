import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

export const likePost = async (post) => {
    try {
        const res = await axiosInstance.put(API_ENDPOINTS.POSTS.LIKE(post._id), {});
        
        if (res.status === 200) {
            apiLog("Post liked successfully");
        }
        apiLog("Post liked successfully", res.data);
        return res.data;
    } catch (error) {
        apiError("Error liking post:", error);
        throw error;
    }
};