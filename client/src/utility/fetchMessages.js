import axios from "axios"

export const fetchChatHistory=async(id,page=1,limit=20)=>{
    try {
        const res=await axios.get(`http://localhost:3000/api/messages/${id}?page=${page}&limit=${limit}`,{
            headers:
            {
                Authorization:`Bearer ${localStorage.getItem('authToken')}`
            }
        })
        console.log("res ",res.data);
        
        // if(!res.data.sucess)
        //     console.error("Error occured while fetching messages")
    
        const data=res.data;
        console.log("data ",data);
    
        return data;
    } catch (error) {
        console.error("Error occured while fetching messages", error);
        throw error;
        
    }
}