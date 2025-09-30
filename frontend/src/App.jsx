import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Signup from './components/Signup'
import Homepage from './components/Homepage'
import Login from './components/Login'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import io from 'socket.io-client'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/otherUsersSlice'
import Protected from './components/Protected'
import IncomingCall from './components/call/IncomingCall'
import WebRTC from './components/call/WebRTC'



const router = createBrowserRouter([
  {
    path: '/',
    element: (
    <Protected>
      <Homepage />
    </Protected>
  )
  },
  {
    path: '/register',
    element: <Signup/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/*',
    element: (
    <Protected>
      <Homepage />
    </Protected>
  )
  },
])

function App() {

  const authUser=useSelector((state) => state.user.authUser); 
 
  const dispatch=useDispatch();
  const { socket } = useSelector((state) => state.socket);
  
  useEffect(() => {
    if(authUser){
      const socket=io(import.meta.env.VITE_BACKEND_URL, {
        query: { userId: authUser.id },
      });
     
      dispatch(setSocket(socket));
      
      socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      })
      return ()=>socket.close();
    }else{
      if(socket){
        socket.close();
        dispatch(setSocket(null));
        dispatch(setOnlineUsers([]));
      }
    }

  }, [authUser]);

  return (
     
    <div className='sm:p-4 h-[90%] md:h-screen flex items-center justify-center'>
    <RouterProvider router={router}/>
    <IncomingCall/>
    <WebRTC/>

    </div>
  
  )
}

export default App
