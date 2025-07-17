import axios from "axios";
import { FiSend } from "react-icons/fi";
import Messages from "./Messages";
import { useState } from "react";
import { useSelector } from "react-redux";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const selectedUser = useSelector((state) => state.selectedUser.selectedUser);
  const user = useSelector((state) => state.user.authUser);
  const receiverId = selectedUser?._id;

  const handleMessageSend = async (message) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/message/send/${receiverId}`,
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

  return (
    <div className="h-[600px] mx-auto flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden w-1/2">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 shadow-md">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={selectedUser?.profilePhoto}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedUser?.fullName}
        </h2>
      </div>

      <Messages />

      <div className="flex items-center gap-2 px-4 py-3 border-t">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          onClick={() => handleMessageSend(message)}
          className="text-pink-500 hover:text-pink-600 text-xl"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
