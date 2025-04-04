import axios from "axios";

export const likePost=async(post)=>{
    try {
        const res=await axios.put(`http://localhost:3000/api/posts/like/${post._id}`,{},{
            headers:{
                Authorization:`Bearer ${localStorage.getItem('authToken')}`
            }
        })
        if(res.status===200){
            console.log("Post liked successfully");
        }
        console.log("Post liked successfully",res.data);
        return res.data;
    } catch (error) {
        console.error("❌ Error liking post:", error);
    }
};