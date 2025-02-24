// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import { composeWithDevTools } from '@redux-devtools/extension';
import authReducer from './reducers/authReducer';
import {configureStore} from "@reduxjs/toolkit"

// const rootReducer = combineReducers({
//   auth: authReducer,
// });

// const store = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware(thunk))
// );

const store=configureStore({
    reducer:{
        auth:authReducer,
    },
    // middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(),
    // devTools: process.env.NODE_ENV !== 'production',
});

export default store;