import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiError } from "../config/api.js";

export const fetchUsersByIds = async (userIds) => {
  try {
    const res = await axiosInstance.post(API_ENDPOINTS.USERS.BULK, { userIds });
    return res.data; // Assuming the backend returns an array of user objects
  } catch (error) {
    apiError("Error fetching users:", error.message);
    throw error;
  }
};