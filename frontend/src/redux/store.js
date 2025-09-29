import {configureStore,combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import otherUserReducer from './otherUsersSlice.js';
import messageReducer from './messageSlice.js';
import socketReducer from './socketSlice.js';
import webRTCReducer from './webRTCSlice.js';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], 
};

const rootReducer = combineReducers({
  user: userReducer,
  otherUsers: otherUserReducer,
  message: messageReducer,
  socket: socketReducer,
  webRTC: webRTCReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});
export const persistor = persistStore(store);