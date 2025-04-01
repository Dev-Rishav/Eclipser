import axios from "axios";

export const fetchUsersByIds = async (userIds) => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/users/bulk",
      { userIds }, // Send userIds as a payload
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    return res.data; // Assuming the backend returns an array of user objects
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
};