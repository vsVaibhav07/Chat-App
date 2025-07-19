import axios from "axios";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import useGetRealTimeMessages from "../hooks/useGetRealTimeMessages";

const Messages = ({ message }) => {
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
  }, [selectedUser, userId, message]);

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
      <div className="flex flex-col items-center p-4">
        <div className="avatar p-1">
          <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
            <img src={selectedUser.profilePhoto} />
          </div>
        </div>
        <h2 className="text-white font-serif font-medium text-xl">{selectedUser.fullName}</h2>
        <p className="text-blue-950 font-medium ">{selectedUser.bio}</p>
      </div>
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
