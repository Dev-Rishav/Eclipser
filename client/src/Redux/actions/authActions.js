import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    SIGNUP_REQUEST,
    SIGNUP_SUCCESS,
    SIGNUP_FAILURE,
    LOGOUT
} from './authActionTypes';

export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    // console.log(credentials);
    
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials);

    const {token} = response.data;
    const user = response.data;;
    
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

export const registerUser = (credentials) => async (dispatch) => {
  dispatch({ type: SIGNUP_REQUEST });
  try {
      await axios.post('http://localhost:3000/api/auth/register', credentials);
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
};
