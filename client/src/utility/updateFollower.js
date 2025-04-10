import axios from "axios";

export const follow = async (followerId, followingId) => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/users/follow",
      {
        followerId: followerId,
        followingId: followingId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (res.status != 200) {
      console.error("Failed to follow the user!");
    }
    // return res.json();
  } catch (error) {
    console.error("Cant make follow request ", error);
    throw error;
  }
};

export const unfollow = async (followerId, followingId) => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/users/unfollow",
      {
        followerId: followerId,
        followingId: followingId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (res.status != 200) console.error("error unfollowing user!");

    // return res.json();
  } catch (error) {
    console.error("error unfollowing user ", error);
    throw error;
  }
};
