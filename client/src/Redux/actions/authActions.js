import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../config/api';
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    SIGNUP_REQUEST,
    SIGNUP_SUCCESS,
    SIGNUP_FAILURE,
    LOGOUT,
    UPDATE_USER,
    UPDATE_FOLLOWING_COUNT
} from './authActionTypes';
import { CLEAR_NOTIFICATIONS } from './notificationActionTypes';

export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    // console.log(`base url is ${API_CONFIG.BASE_URL}`);
    
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, credentials);

    const {token} = response.data;
    const user = response.data;;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user',JSON.stringify(user));
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user, token }
    });
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response?.data?.message || 'Login failed'
    });
    throw error;
  }
};

export const registerUser = (credentials) => async (dispatch) => {
  dispatch({ type: SIGNUP_REQUEST });
  try {
      await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, credentials);
      toast.success(`Registration successful! Please login with your credentials.`);


      dispatch({
          type: SIGNUP_SUCCESS,
          payload: { message: 'Registration successful' }
      });

  } catch (error) {
      dispatch({
          type: SIGNUP_FAILURE,
          payload: error.response?.data?.message || 'Registration failed'
      });
      toast.error("Registration failed. Please try again.");
      throw error;
  }
};


export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user')
  dispatch({ type: LOGOUT });
  
  // Clear notifications on logout
  dispatch({ type: CLEAR_NOTIFICATIONS });
};


export const patchUserTopics = (targetTopic, isRemoving) => async (dispatch) => {
  try {
    const token = localStorage.getItem('authToken'); // or from state
    const userId = JSON.parse(localStorage.getItem('user'))._id; // or from state
    // console.log('userId:', userId," targetTopic:", targetTopic, "isRemoving:", isRemoving);
    
    const response = await axios.patch(`${API_CONFIG.BASE_URL}/api/user/profile/${userId}`, {
      targetTopics: targetTopic,
      isRemoving: isRemoving,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    // console.log('Response from server:', response.data);
    

    if(!response.data.success){
      console.error('Error from server:', response.data);
      
      throw new Error(response.data.error || 'Failed to update subscribed topics');
    }
    const updatedUser = response.data.user;

    // Sync Redux + localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: UPDATE_USER,
      payload: updatedUser
    });

    return updatedUser;
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    throw error;
  }
};


export const updateFollowerCount=(newFollowingCount)=>(dispatch)=>{
  try {
    // Update the Redux state
    console.log("newFollowingCount", newFollowingCount);
    
    dispatch({
      type: UPDATE_FOLLOWING_COUNT,
      payload: { followingCount: newFollowingCount },
    });
    // console.log("yes");
    
    // Update localStorage to keep it in sync
    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...user, followingCount: newFollowingCount };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating follower count:", error);
    throw error;
  }

}