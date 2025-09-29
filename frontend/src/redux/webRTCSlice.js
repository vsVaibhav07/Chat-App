import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callStatus: "idle", // idle | ringing | connected
  incoming: null,     // { from, name, offer }
  selectedCallUser: null, // user for current call
  localStream: null,
  remoteStream: null,
};

const webRTCSlice = createSlice({
  name: "webRTC",
  initialState,
  reducers: {
    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
    },
    setIncoming: (state, action) => {
      state.incoming = action.payload;
    },
    setSelectedCallUser: (state, action) => {
      state.selectedCallUser = action.payload;
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    resetCall: (state) => {
      state.callStatus = "idle";
      state.incoming = null;
      state.selectedCallUser = null;
      state.localStream = null;
      state.remoteStream = null;
    },
  },
});

export const {
  setCallStatus,
  setIncoming,
  setSelectedCallUser,
  setLocalStream,
  setRemoteStream,
  resetCall,
} = webRTCSlice.actions;

export default webRTCSlice.reducer;
