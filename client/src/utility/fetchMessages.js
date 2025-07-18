import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

export const fetchChatHistory = async (id, page = 1, limit = 20) => {
    try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.MESSAGES.BASE(id)}?page=${page}&limit=${limit}`);
        apiLog("res ", res.data);
        
        const data = res.data;
        apiLog("data ", data);
    
        return data;
    } catch (error) {
        apiError("Error occurred while fetching messages", error);
        throw error;
    }
}