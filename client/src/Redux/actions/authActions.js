import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from './authActionTypes';
import axios from 'axios';

export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await axios.post('http://localhost:8080/login', credentials);
    const {user,token} = response.data;
    
    localStorage.setItem('authToken', token);
    
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user, token }
    });
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response?.data?.message || 'Login failed'
    });
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  // Clear stored token
  localStorage.removeItem('authToken');
  dispatch({ type: LOGOUT });
};

// Add other auth-related actions (token validation, silent refresh, etc.) as needed