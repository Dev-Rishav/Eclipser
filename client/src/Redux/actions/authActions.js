import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from './authActionTypes';
import axios from 'axios';

export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
    const {user,token} = response.data;
  
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user',JSON.stringify(user));
    
    
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
  localStorage.removeItem('authToken');
  localStorage.removeItem('user')
  dispatch({ type: LOGOUT });
};
