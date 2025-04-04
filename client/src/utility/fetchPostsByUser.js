import axios from "axios";

export const fetchPostsByUser = async (userId) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`, 
      },
    });

    return res.data; // Return the posts directly
  } catch (error) {
    console.error("Error fetching posts by user:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch posts by user"
    );
  }
};