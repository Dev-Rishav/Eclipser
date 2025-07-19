import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiError } from "../config/api.js";

export const fetchTagsList = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.POSTS.TAG_STATS);
        return response.data;
    } catch (error) {
        apiError('Error fetching tags list:', error);
        throw error;
    }
}