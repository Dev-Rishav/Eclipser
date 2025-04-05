import axios from "axios";

export const fetchPostsByTags = async (tags = [], page = 1, limit = 10) => {
  console.log("🔄 Fetching Posts");

  try {
    console.log("🛠 Fetching from Backend");
    const response = await axios.post("http://localhost:3000/api/posts/tags",{
      tags,
      page,
      limit,
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }});

    localStorage.setItem("cachedPosts", JSON.stringify(response.data)); // Store in cache
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
};

export const fetchRemainingPosts = async (tags = [], page = 1, limit = 10) => {
  console.log("🔄 Fetching Remaining Posts");

  try {
    console.log("🛠 Fetching from Backend");
    const response = await axios.post("http://localhost:3000/api/posts/remainingPosts", {
      tags,
      page,
      limit,
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }});

    localStorage.setItem("cachedRemainingPosts", JSON.stringify(response.data)); // Store in cache
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching remaining posts:", error);
    return [];
  }
};
