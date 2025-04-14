import authReducer from './reducers/authReducer';
import {configureStore} from "@reduxjs/toolkit"
import socketReducer from './reducers/socketReducer';


const store=configureStore({
    reducer:{
        auth:authReducer,
        socket:socketReducer,
    },
});

export default store;