import React, { useEffect } from "react";
import { FiPhoneIncoming, FiPhoneOff, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";

const IncomingCall = ({ callerName = "Unknown Caller", onAnswer, onReject }) => {
  const { callStatus } = useSelector((store) => store.webRTC);

  useEffect(() => {
    console.log("📞 Call status changed:", callStatus);
  }, [callStatus]);

  // Agar call ringing nahi hai to kuch bhi render na kare
  if (callStatus !== "ringing") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 flex flex-col items-center animate-fadeIn">
        {/* Caller Avatar */}
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 border-4 border-green-500 animate-pulse">
          <FiUser size={36} />
        </div>

        {/* Caller Name */}
        <h2 className="text-xl font-semibold">{callerName}</h2>
        <p className="text-gray-400 text-sm mt-1">is calling you...</p>

        {/* Buttons */}
        <div className="flex gap-6 mt-6">
          <button
            onClick={onAnswer}
            className="bg-green-600 hover:bg-green-700 transition px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
          >
            <FiPhoneIncoming size={20} /> Answer
          </button>
          <button
            onClick={onReject}
            className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
          >
            <FiPhoneOff size={20} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
