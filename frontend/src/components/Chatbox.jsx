import axios from "axios";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Messages from "./Messages";
import { MdArrowBack } from "react-icons/md";
import { setSelectedUser } from "../redux/otherUsersSlice";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const {selectedUser,onlineUsers } = useSelector((state) => state.otherUsers);
  const user = useSelector((state) => state.user.authUser);
  const receiverId = selectedUser?._id;
  const isOnline = (userId) => onlineUsers?.includes(userId);
  const dispatch=useDispatch();

  const handleMessageSend = async (message) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send/${receiverId}`,
        { message, receiverId },
        {
          withCredentials: true,
        }
      );
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="w-[50%] h-[94vh] text-center p-10 hidden font-bold text-2xl  md:flex items-center justify-center text-gray-100 italic">
        Select a user to start chatting 💬
      </div>
    );
  }

  return (
    <div className="h-[94vh] w-full sm:w-[90%] md:w-4/7  mx-auto flex flex-col shadow-xl bg-gray-200/60 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-300">
      
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-500/50 shadow-md">
        <div onClick={()=>{dispatch(setSelectedUser(null))}} className="hover:scale-110 text-2xl md:hidden"><MdArrowBack/></div>
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white">
          <img
            src={selectedUser?.profilePhoto}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-lg text-white font-semibold tracking-wide">
          {selectedUser?.fullName}
        </h2>
        <p className={`text-sm ${isOnline(receiverId) ? "text-green-500" : "text-gray-500"}`}>
          {isOnline(receiverId) ? "Online" : ""}
        </p>
        </div>
        </div>

     
      <div className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
        <Messages message={message} />
      </div>

     
      <div className="flex items-center gap-0.5 sm:gap-2 px-0.5 sm:px-4 py-3 border-t bg-white/80 backdrop-blur">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 w-[90%] px-2 sm:px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={() => handleMessageSend(message)}
          className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
