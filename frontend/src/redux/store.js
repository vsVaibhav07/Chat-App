import {configureStore} from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import otherUserReducer from './otherUsersSlice.js';
import selectedUserReducer from './selectedUserSlice.js';

const store=configureStore({
    reducer:{
        user:userReducer,
        otherUsers:otherUserReducer,
        selectedUser:selectedUserReducer
    }
});
export default store;