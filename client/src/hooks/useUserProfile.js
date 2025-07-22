import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axiosConfig'; // Assuming a configured axios instance
import { API_ENDPOINTS } from '../config/api';
import { getFollowStatus } from '../utility/getFollowStatus';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID provided.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user data, posts, and follow status in parallel
    //   const [userRes, postsRes, followStatusRes] = await Promise.all([
    //     axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(userId)),
    //     axiosInstance.get(API_ENDPOINTS.POSTS.BY_USER(userId)),
    //     getFollowStatus(userId)
    //   ]);
        const userRes= await axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(userId));
        const postsRes = await axiosInstance.get(API_ENDPOINTS.POSTS.BY_USER(userId));
     
        const followStatusRes = await getFollowStatus(userId);


      setProfile(userRes.data.user);
      console.log("User Posts: ", postsRes.data.posts);

      setPosts(postsRes?.data.posts);
      setIsFollowing(followStatusRes);

    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      setError("Failed to load operator profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to manually update follow status from the component
  const setFollowStatus = (status) => {
    setIsFollowing(status);
    setProfile(p => ({ ...p, followerCount: status ? p.followerCount + 1 : p.followerCount - 1 }));
  };

  return { profile, posts, isFollowing, loading, error, setFollowStatus, refresh: fetchData };
};