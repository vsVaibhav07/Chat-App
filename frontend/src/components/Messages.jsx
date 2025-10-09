import axios from "axios";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import useGetRealTimeMessages from "../hooks/useGetRealTimeMessages";
import { FiDownload } from "react-icons/fi";

const Messages = ({ lastMessage, message }) => {
  useGetRealTimeMessages();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  const { selectedUser } = useSelector((state) => state.otherUsers);
  const authUser = useSelector((state) => state.user.authUser);
  const { messages } = useSelector((state) => state.message);
  const userId = authUser?.id;

  const fetchMessages = async () => {
    try {
      if (selectedUser?._id && userId) {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/${
            selectedUser._id
          }`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
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
  }, [selectedUser, userId, message,lastMessage]);

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
    <div className="flex-1 overflow-y-auto sm:px-4 py-3 space-y-2">
      <div className="flex flex-col items-center p-4">
        <div className="avatar p-1">
          <div className="ring-primary  ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
            <img src={selectedUser.profilePhoto} />
          </div>
        </div>
        <h2 className="text-white font-serif font-medium text-xl">
          {selectedUser.fullName}
        </h2>
        <p className="text-blue-950 font-medium text-center ">
          {selectedUser.bio}
        </p>
      </div>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat ${
            message.senderId === userId ? "chat-end" : "chat-start"
          }`}
        >
          <div
            className={`chat-bubble w-fit max-w-4/7 flex flex-col ${
              message.senderId === userId
                ? "bg-green-300 text-gray-800"
                : "bg-pink-300 text-gray-800"
            }`}
          >
            {message?.mediaUrl && message.mediaType === "image" && (
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <img
                  src={message.mediaUrl}
                  alt="Message media"
                  className="w-full h-auto object-cover rounded-xl shadow-md"
                />
              </div>
            )}
            {message?.mediaUrl && message.mediaType === "video" && (
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <video
                  src={message.mediaUrl}
                  controls
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
            )}

            {message?.mediaUrl && message.mediaType === "raw" && (
              <a
                href={message.mediaUrl}
                className="flex items-center gap-2 sm:px-3 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-blue-600 font-medium"
                download
              >
                <FiDownload /> Download File
              </a>
            )}
            {message?.text && message.text}
          </div>
        </div>
      ))}
      {lastMessage && (
        <div className="chat chat-end">
          <div className="chat-bubble w-fit max-w-4/7 flex flex-col bg-green-300 text-gray-800">
            {lastMessage}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="w-0 h-0" />
    </div>
  );
};

export default Messages;
