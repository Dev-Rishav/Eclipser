import { createStore } from 'redux';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
};

// Reducer
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// Create store
const store = createStore(rootReducer);

export default store;