
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Messages from "./Messages";
import { MdArrowBack, MdVideoCall } from "react-icons/md";
import { setSelectedUser } from "../redux/otherUsersSlice";
import useWebRTC from "../hooks/useWebRTC";
import ChatInput from "./ChatInput";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const [lastMessage,setLastMessage]=useState("")
  const [searching,setSearching]=useState(false);
  const { selectedUser, onlineUsers } = useSelector(
    (state) => state.otherUsers
  );
  const { startCall } = useWebRTC();
  const dispatch = useDispatch();
 
  const [file, setFile] = useState(null);

  const receiverId = selectedUser?._id;
  const isOnline = (userId) => onlineUsers?.includes(userId);

  

  if (!selectedUser) {
    return (
      <div className="w-[50%] h-[94vh] text-center p-10 hidden font-bold text-2xl md:flex items-center justify-center text-gray-100 italic">
        Select a user to start chatting 💬
      </div>
    );
  }

  return (
    <div className=" h-[90vh] md:h-[94vh] w-full sm:w-[60%] flex flex-col rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
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
            className={`text-sm ${
              isOnline(receiverId) ? "text-green-500" : "text-gray-500"
            }`}
          >
            {isOnline(receiverId) ? "Online" : ""}
          </p>
        </div>
        <div className="flex-grow flex justify-end">
          <button
            onClick={startCall}
            className="btn btn-sm btn-ghost text-white text-2xl"
            title="Start video call"
          >
            <MdVideoCall />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
        <Messages message={message} lastMessage={lastMessage} searching={searching}/>
      </div>

      <div>
        {file && (
          <div className="flex items-center justify-between bg-gray-700 p-2 mx-4 mb-2 rounded">
            <span className="text-gray-200">{file.name}</span>{" "}
            <button onClick={() => setFile(null)} className="text-gray-400">
              Remove
            </button>
          </div>
        )}
      </div>

     <ChatInput
     setSearching={setSearching}
     setLastMessage={setLastMessage}
  message={message}
  setMessage={setMessage}
  file={file}
  setFile={setFile}
  receiverId={receiverId}
/>
    </div>
  );
};

export default Chatbox;
