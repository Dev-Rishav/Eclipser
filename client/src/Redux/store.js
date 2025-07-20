import authReducer from './reducers/authReducer';
import notificationReducer from './reducers/notificationReducer';
import {configureStore} from "@reduxjs/toolkit"


const store=configureStore({
    reducer:{
        auth:authReducer,
        notifications: notificationReducer,
    },
});

export default store;