import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FiPhoneOff } from "react-icons/fi";
import useWebRTC from "../../hooks/useWebRTC";

const WebRTC = () => {
  const { callStatus, incoming, localStream, remoteStream } = useSelector(
    (state) => state.webRTC
  );

  const { startCall, answerIncoming, endCall } = useWebRTC();

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ✅ always call hooks first, condition later
  useEffect(() => {
    if (myVideoRef.current && localStream) {
      myVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ✅ condition after hooks
  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => endCall()}
      />
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">
            {incoming ? incoming.name : "Video Call"}
          </h2>
          <button
            onClick={() => endCall()}
            className="btn btn-danger flex items-center gap-2"
          >
            <FiPhoneOff /> End Call
          </button>
        </div>

        {/* Video area */}
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="flex-1 bg-black h-[60vh] object-cover rounded-lg"
          />
          <div className="w-56 flex flex-col gap-3">
            <video
              ref={myVideoRef}
              muted
              autoPlay
              playsInline
              className="w-full h-40 object-cover rounded-md"
            />
            {callStatus === "ringing" && incoming && (
              <button
                onClick={answerIncoming}
                className="btn btn-success w-full"
              >
                Answer Call
              </button>
            )}
            {callStatus === "ringing" && !incoming && (
              <div className="text-center text-white">Calling...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRTC;
