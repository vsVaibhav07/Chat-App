import Sidebar from './Sidebar'
import Chatbox from './Chatbox'
import EditProfile from './EditProfile'
import { useSelector } from 'react-redux';


const Homepage = () => {
  const {userProfile}=useSelector((state) => state.user);
 
  return (
     userProfile?
      (<EditProfile/>):
    <div className="flex  md:flex-row h-screen w-full p-1.5 sm:p-6 max-h-screen overflow-hidden">

   
      <Sidebar />
      <Chatbox  />
      
    </div>
  )
}

export default Homepage
