import axios from "axios"

export const fetchChatHistory=async(id)=>{
    try {
        const res=await axios.get(`http://localhost:3000/api/messages/${id}`,{
            headers:
            {
                Authorization:`Bearer ${localStorage.getItem('authToken')}`
            }
        })
        console.log("res ",res.data);
        
        if(!res.data.sucess)
            console.error("Error occured while fetching messages")
    
        const data=res.data.messages;
    
        return data;
    } catch (error) {
        console.error("Error occured while fetching messages", error);
        throw error;
        
    }
}