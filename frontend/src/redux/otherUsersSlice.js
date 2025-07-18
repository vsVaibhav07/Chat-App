import { createSlice } from "@reduxjs/toolkit";

const otherUsersSlice=createSlice({
    name:"otherUsers",
    initialState:{
        otherUsers:null,
        onlineUsers: null,
        selectedUser: null,
    },
    reducers:{  
        setOtherUsers(state, action) {
            state.otherUsers = action.payload;
        },
        setOnlineUsers(state, action) {
            state.onlineUsers = action.payload;
        },
        setSelectedUser(state, action) {
            state.selectedUser = action.payload;
        }
    }
})

export const { setOtherUsers, setOnlineUsers, setSelectedUser } = otherUsersSlice.actions;
export default otherUsersSlice.reducer;