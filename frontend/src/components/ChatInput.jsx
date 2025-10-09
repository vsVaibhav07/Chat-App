import  { useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {  FiPlus, FiSend } from "react-icons/fi";
import { addMessage } from "../redux/messageSlice";
import { useDispatch } from "react-redux";

const ChatInput = ({setLastMessage, message, setMessage, file, setFile, receiverId }) => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleMessageSend = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    setLastMessage(message);
    const lastMessage=message
    setMessage("");

    try {
      const formData = new FormData();
      if (message) formData.append("message", lastMessage);
      if (file) formData.append("file", file);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send/${receiverId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      if (res.data.success && res.data.newMessage) {
        setLastMessage("");
        dispatch(addMessage(res.data.newMessage));
      }

      setMessage("");
      setFile(null);
    } catch (error) {
      setMessage(lastMessage)
      console.error(error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <form
      onSubmit={handleMessageSend}
      className="flex items-center gap-1 px-4 py-3 border-t bg-gray-700/80 backdrop-blur"
    >
      <FiPlus
        onClick={() => fileInputRef.current.click()}
        className="text-gray-400 text-2xl cursor-pointer"
      />
      <input
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files[0])}
        className="hidden"
        type="file"
        accept="image/*, video/*, .pdf, .docx"
      />

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-2 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-900 text-white placeholder-gray-400"
      />

      <button
        type="submit"
        className="btn btn-circle bg-pink-500 text-white hover:bg-pink-600"
      >
        <FiSend />
        
      </button>
    </form>
  );
};

export default ChatInput;
