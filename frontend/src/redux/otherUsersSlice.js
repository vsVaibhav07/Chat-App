import { createSlice } from "@reduxjs/toolkit";

const otherUsersSlice=createSlice({
    name:"otherUsers",
    initialState:{
        otherUsers:null,
    },
    reducers:{  
        setOtherUsers(state, action) {
            state.otherUsers = action.payload;
        }
    }
})

export const { setOtherUsers } = otherUsersSlice.actions;
export default otherUsersSlice.reducer;