
import axios from "axios";
import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Messages from "./Messages";
import { MdArrowBack } from "react-icons/md";
import { setSelectedUser } from "../redux/otherUsersSlice";
import toast from "react-hot-toast";
import WebRTCModal from "./WebRTC";

const Chatbox = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { selectedUser, onlineUsers } = useSelector((state) => state.otherUsers);

  const receiverId = selectedUser?._id;
  const isOnline = (userId) => onlineUsers?.includes(userId);
  const dispatch = useDispatch();

  const handleMessageSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

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
      toast.error("Failed to send message.");
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
    <div className="h-[94vh] w-full sm:w-[60%] flex flex-col rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
      {/* Chatbox Header */}
      <div className="flex items-center gap-2 sm:gap-4 p-4 border-b bg-gray-700">
        <div
          onClick={() => dispatch(setSelectedUser(null))}
          className="cursor-pointer text-white text-2xl md:hidden"
        >
          <MdArrowBack />
        </div>
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
          <p
            className={`text-sm ${isOnline(receiverId) ? "text-green-500" : "text-gray-500"}`}
          >
            {isOnline(receiverId) ? "Online" : ""}
          </p>
        </div>

        <div className="flex-grow flex justify-end">
          {/* open call modal */}
          <button
            onClick={() => setOpen(true)}
            className="btn btn-sm btn-ghost text-white text-2xl"
            title="Start video call"
          >
            📞
          </button>

         
          {open && (
            <WebRTCModal selectedUser={selectedUser} open={open} setOpen={setOpen} />
          )}
        </div>
      </div>

      <>
        <div className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
          <Messages message={message} />
        </div>

        <form
          onSubmit={handleMessageSend}
          className="flex items-center gap-0.5 sm:gap-2 px-0.5 sm:px-4 py-3 border-t bg-gray-700/80 backdrop-blur"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 w-[90%] px-2 sm:px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-900 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="btn btn-circle bg-pink-500 text-white hover:bg-pink-600"
          >
            <FiSend />
          </button>
        </form>
      </>
    </div>
  );
};

export default Chatbox;

