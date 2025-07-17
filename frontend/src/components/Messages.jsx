import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const Messages = () => {
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const selectedUser = useSelector((state) => state.selectedUser.selectedUser);
  const authUser = useSelector((state) => state.user.authUser);
  const userId = authUser?.id; // ✅ fixed from _id to id

  const fetchMessages = async () => {
    try {
      if (selectedUser?._id && userId) {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/message/${selectedUser._id}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (selectedUser?._id && userId) {
      fetchMessages();
    }
  }, [selectedUser, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to start chat
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat ${
            message.senderId === userId ? "chat-end" : "chat-start"
          }`}
        >
          <div
            className={`chat-bubble ${
              message.senderId === userId
                ? "bg-pink-100 text-gray-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {message.text}
          </div>
          <div ref={scrollRef} className="w-0 h-0" />
        </div>
      ))}
    </div>
  );
};

export default Messages;
