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
        const storedPosts=localStorage.getItem('cachedPosts');
        if(storedPosts){
            const posts=JSON.parse(storedPosts);
            const updatedPosts=posts.map((p)=>p._id===post._id?{...p,likes:[...p.likes,res.data]}:p);
            localStorage.setItem('cachedPosts',JSON.stringify(updatedPosts));
        }
        return res.data;
    } catch (error) {
        console.error("❌ Error liking post:", error);
    }
};