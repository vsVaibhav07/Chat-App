import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
    name:"user",
    initialState:{
        authUser:null,
        userProfile:null
    },
    reducers:{  
        setAuthUser(state, action) {
            state.authUser = action.payload;
        },
        setUserProfile(state,action){
            state.userProfile=action.payload;
        }
    }
})

export const { setAuthUser,setUserProfile } = userSlice.actions;
export default userSlice.reducer;