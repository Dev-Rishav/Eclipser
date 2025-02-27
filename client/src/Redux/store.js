import authReducer from './reducers/authReducer';
import {configureStore} from "@reduxjs/toolkit"


const store=configureStore({
    reducer:{
        auth:authReducer,
    },
});

export default store;