import axios from "axios";


export const fetchRecentChats = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/messages/onetoone/recentChats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
      params: {
        page,
        limit
      }
    });

    const data = response.data;
    console.log("Paginated Recent Chats:", data);

    return {
      chats: data.chats || [],
      page: data.page,
      limit: data.limit,
      totalChats: data.totalChats
    };
    
  } catch (error) {
    console.error('❌ Error fetching recent chats:', error);
    return {
      chats: [],
      page: 1,
      limit: 10,
      totalChats: 0
    };
  }
};

  
  export const formatCosmicTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ly`;
  };
  
  export const generateUserAvatar = (username, isOnline) => {
    if(!username) {
      return {
        initials: '??',
        gradient: 'bg-gray-500'
      };
    }
    const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
    const gradient = `bg-gradient-to-br from-nebula to-supernova`;
    
    return {
      initials,
      gradient,
      statusColor: isOnline ? 'bg-green-400' : 'bg-gray-500'
    };
  };