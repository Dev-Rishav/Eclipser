import axios from "axios";

export const getFollowStatus = async (followingId) => {
  try {
    const res = await axios.get(
      `http://localhost:3000/api/users/followStats/${followingId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (res.status == 200) console.log("status fetched successfully");
    console.log("res.data=",res.data);
    

    return res.data.isFollowing;
  } catch (error) {
    console.error("error fetching follow status ",error);
    throw error;
  }
};
