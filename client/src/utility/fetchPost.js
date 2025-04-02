import axios from "axios";

export const fetchPosts = async () => {
  console.log("🔄 Fetching Posts");
  
  // const cachedPosts = localStorage.getItem("cachedPosts");

  // if (cachedPosts) {
  //   console.log("♻️ Using LocalStorage Cache");
  //   return JSON.parse(cachedPosts);
  // }

  try {
    console.log("🛠 Fetching from Backend");
    const response = await axios.get("http://localhost:3000/api/posts");

    localStorage.setItem("cachedPosts", JSON.stringify(response.data)); // Store in cache
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
};