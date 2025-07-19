import axiosInstance from "../config/axiosConfig.js";
import { API_ENDPOINTS, apiError } from "../config/api.js";

export const fetchRecentChats = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.RECENT_CHATS, {
      params: {
        page,
        limit
      }
    });

    const data = response.data;
    // console.log("Paginated Recent Chats:", data);

    return {
      chats: data.chats || [],
      page: data.page,
      limit: data.limit,
      totalChats: data.totalChats
    };
    
  } catch (error) {
    apiError('❌ Error fetching recent chats:', error);
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
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return '🌟 Just now';
  if (diffInMinutes < 60) return `⏰ ${diffInMinutes}m ago`;
  if (diffInHours < 24) return `🕐 ${diffInHours}h ago`;
  if (diffInDays < 7) return `📅 ${diffInDays}d ago`;
  
  return `🗓️ ${date.toLocaleDateString()}`;
};

export const generateUserAvatar = (username, isOnline) => {
  if(!username) {
    return {
      initials: '??',
      gradient: 'bg-gray-500',
      statusColor: 'bg-gray-500'
    };
  }
  const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
  const gradient = `bg-gradient-to-br from-nebula to-supernova`;
  
  return {
    initials: initials.slice(0, 2),
    gradient,
    statusColor: isOnline ? 'bg-green-400' : 'bg-gray-500'
  };
};