import axios from "axios";
import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBack } from "react-icons/md";
import { setSelectedUser } from "../redux/otherUsersSlice";
import toast from "react-hot-toast";
import Messages from "./Messages";
import WebRTC from "./WebRTC";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const [inCall, setInCall] = useState(false);

  const { selectedUser, onlineUsers } = useSelector((state) => state.otherUsers);
  const authUser = useSelector((state) => state.user.authUser);
  const dispatch = useDispatch();

  const isOnline = (id) => onlineUsers?.includes(id);

  const handleMessageSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send/${selectedUser._id}`,
        { message },
        { withCredentials: true }
      );
      setMessage("");
    } catch {
      toast.error("Message failed");
    }
  };

  if (!selectedUser) {
    return (
      <div className="w-[50%] h-[94vh] text-center p-10 hidden md:flex items-center justify-center text-gray-100 italic">
        Select a user to start chatting 💬
      </div>
    );
  }

  return (
    <div className="h-[94vh] w-full sm:w-[60%] flex flex-col rounded-xl overflow-hidden bg-gray-800">
      <div className="flex items-center gap-2 p-4 border-b bg-gray-700">
        <div onClick={() => dispatch(setSelectedUser(null))} className="cursor-pointer text-white text-2xl md:hidden">
          <MdArrowBack />
        </div>
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white">
          <img src={selectedUser?.profilePhoto} alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg text-white font-semibold">{selectedUser?.fullName}</h2>
          <p className={isOnline(selectedUser._id) ? "text-green-500 text-sm" : "text-gray-500 text-sm"}>
            {isOnline(selectedUser._id) ? "Online" : ""}
          </p>
        </div>
        {!inCall && (
          <div className="flex-grow flex justify-end">
            <button onClick={() => setInCall(true)} className="btn btn-sm btn-ghost text-white text-2xl">
              📞
            </button>
          </div>
        )}
      </div>

      {inCall ? (
        <WebRTC selectedUser={selectedUser} onEnd={() => setInCall(false)} />
      ) : (
        <>
          <div className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
            <Messages />
          </div>
          <form onSubmit={handleMessageSend} className="flex items-center gap-2 px-4 py-3 border-t bg-gray-700">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 rounded-full border border-gray-600 bg-gray-900 text-white"
            />
            <button type="submit" className="btn btn-circle bg-pink-500 text-white hover:bg-pink-600">
              <FiSend />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chatbox;
