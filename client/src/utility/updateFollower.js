import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiError } from "../config/api.js";

export const follow = async (followerId, followingId) => {
  try {
    const res = await axiosInstance.post(API_ENDPOINTS.USERS.FOLLOW, {
      followerId: followerId,
      followingId: followingId,
    });

    if (res.status != 200) {
      apiError("Failed to follow the user!");
    }
    // return res.json();
  } catch (error) {
    apiError("Can't make follow request", error);
    throw error;
  }
};

export const unfollow = async (followerId, followingId) => {
  try {
    const res = await axiosInstance.post(API_ENDPOINTS.USERS.UNFOLLOW, {
      followerId: followerId,
      followingId: followingId,
    });

    if (res.status != 200) {
      apiError("Failed to unfollow the user!");
    }
  } catch (error) {
    apiError("Can't make unfollow request", error);
    throw error;
  }
};
