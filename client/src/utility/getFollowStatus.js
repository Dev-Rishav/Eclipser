import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiLog, apiError } from "../config/api.js";

export const getFollowStatus = async (followingId) => {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.USERS.FOLLOW_STATS(followingId));

    if (res.status == 200) apiLog("status fetched successfully");
    apiLog("res.data=", res.data);

    return res.data.isFollowing;
  } catch (error) {
    apiError("error fetching follow status", error);
    throw error;
  }
};
