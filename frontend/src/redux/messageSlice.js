import { createSlice } from "@reduxjs/toolkit";

const messageSlice=createSlice({
    name:"message",
    initialState:{
        messages:[],
    },
    reducers:{
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            const exists = state.messages.find(msg => msg._id === action.payload._id);
            if(!exists){
                state.messages.push(action.payload);
            }
            
        }
    }
})

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;

