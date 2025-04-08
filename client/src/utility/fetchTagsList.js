import axios from "axios";

export const fetchTagsList = async () =>{
    try {
        const response = await axios.get('http://localhost:3000/api/posts/tagStats',
            {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            }
        );
        console.log("Tags List:", response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching tags list:', error);
        throw error;
    }
}