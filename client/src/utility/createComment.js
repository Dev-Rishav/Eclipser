import axios from "axios";
import { API_CONFIG } from "../config/api";

export const createComment = async (postId, content) => {
  try {
    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/posts/comment/${postId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (res.status === 201) {
      console.log("Comment created successfully");

      // Update localStorage with new comments
      const storedPosts = localStorage.getItem("cachedPosts");
      if (storedPosts) {
        const posts = JSON.parse(storedPosts);
        const updatedPosts = posts.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, res.data] }
            : p
        );
        localStorage.setItem("cachedPosts", JSON.stringify(updatedPosts));
      }
      // console.log("res.data", res.data);
      
      return res.data; // Return the created comment
    }
  } catch (error) {
    console.error("Error occurred while creating comment:", error.message);
    throw error; // Throw the error to be handled by the caller
  }
};