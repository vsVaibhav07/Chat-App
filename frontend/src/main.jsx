import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  { Toaster } from 'react-hot-toast';
import {Provider} from 'react-redux'
import {store,persistor }from './redux/store'
import { PersistGate } from 'redux-persist/integration/react';


createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
    <PersistGate loading={"loading..."} persistor={persistor}>
    <App />
    <Toaster/>
  </PersistGate>
  </Provider>
  </StrictMode>,
)
