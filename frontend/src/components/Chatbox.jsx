import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Messages from "./Messages";
import { MdArrowBack } from "react-icons/md";
import { setSelectedUser } from "../redux/otherUsersSlice";
import toast from "react-hot-toast";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const { selectedUser, onlineUsers } = useSelector(
    (state) => state.otherUsers
  );
  const authUser = useSelector((state) => state.user.authUser);
  const { socket } = useSelector((state) => state.socket);
  const receiverId = selectedUser?._id;
  const isOnline = (userId) => onlineUsers?.includes(userId);
  const dispatch = useDispatch();

  const [inCall, setInCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // "idle" | "ringing" | "connected" | "ended"
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideoRef = useRef();
  const userVideoRef = useRef();


  const createPeerConnection = (remoteUserId) => {
    const pc = new RTCPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

   
    pc.ontrack = (event) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ICE candidate -> send to other peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          from: authUser?.id,
          to: remoteUserId,
        });
      }
    };

    return pc;
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ offer, from, name }) => {
      // offer is expected to be a stringified SDP or object
      console.log("Receiving call from:", name, from);
      setCallerName(name || "Unknown");
      setCallerId(from);
      setCallerSignal(offer);
      setCallStatus("ringing");
      setInCall(true);
      toast(`Incoming call from ${name}`, { duration: 5000 });
    };

    const handleCallAccepted = async ({ answer, from }) => {
      // answer expected to be stringified SDP or object
      try {
        if (!peerConnection) {
          console.warn("No peerConnection present to set remote description");
          return;
        }
        const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(parsed)
        );
        setCallStatus("connected");
        setCallAccepted(true);
        toast.success("Call connected!");
      } catch (err) {
        console.error("Error applying remote answer:", err);
      }
    };

    const handleRemoteIce = async ({ candidate, from }) => {
      try {
        if (!peerConnection || !candidate) return;
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding remote ICE candidate:", err);
      }
    };

    const handleCallEnded = ({ from }) => {
      toast("Call ended by the other user.");
      endCall(false); // don't emit again
    };

    socket.on("callUser", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("iceCandidate", handleRemoteIce);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("callUser", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("iceCandidate", handleRemoteIce);
      socket.off("callEnded", handleCallEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, peerConnection, stream]);

  // Manage local media when call state changes
  useEffect(() => {
    if (!inCall) {
      // stop local tracks if any
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      return;
    }

    // request media
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!mounted) return;
        setStream(currentStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
        toast.error(
          "Error accessing your camera and microphone. Please grant permissions."
        );
        endCall();
      });

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCall]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (peerConnection) {
        try {
          peerConnection.close();
        } catch (_) {}
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Caller: start call (create offer)
  const handleCallUser = async () => {
    if (!selectedUser || !stream) {
      toast.error(
        "Please select a user and ensure camera/mic permissions are granted."
      );
      return;
    }

    try {
      const pc = createPeerConnection(selectedUser._id);
      setPeerConnection(pc);

      // create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // send offer to signaling server (callee)
      if (socket) {
        socket.emit("callUser", {
          offer: JSON.stringify(pc.localDescription),
          from: authUser?.id,
          to: selectedUser._id,
          name: authUser?.fullName,
        });
      }

      setInCall(true);
      setCallStatus("ringing");
      toast("Calling...");
    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error("Failed to start the call.");
      endCall();
    }
  };

  // Callee: answer incoming call
  const handleAnswerCall = async () => {
    if (!callerId || !callerSignal) {
      toast.error("No incoming call to answer.");
      return;
    }

    try {
      const pc = createPeerConnection(callerId);
      setPeerConnection(pc);

      // set remote description from caller's offer
      const parsedOffer =
        typeof callerSignal === "string"
          ? JSON.parse(callerSignal)
          : callerSignal;
      await pc.setRemoteDescription(new RTCSessionDescription(parsedOffer));

      // create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send answer back to caller
      if (socket) {
        socket.emit("answerCall", {
          answer: JSON.stringify(pc.localDescription),
          from: authUser?.id,
          to: callerId,
        });
      }

      setCallAccepted(true);
      setCallStatus("connected");
      toast.success("Call accepted.");
    } catch (err) {
      console.error("Failed to answer call:", err);
      toast.error("Failed to answer the call.");
      endCall();
    }
  };

  // End call and optionally emit to the other peer
  // emitRemote: true to notify other peer; false when remote already notified
  const endCall = (emitRemote = true) => {
    try {
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
    } catch (e) {
      console.warn("Error closing peerConnection:", e);
    }

    if (stream) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("Error stopping tracks:", e);
      }
      setStream(null);
    }

    if (emitRemote && socket && (selectedUser || callerId)) {
      const to = selectedUser?._id || callerId;
      socket.emit("callEnded", { from: authUser?.id, to });
    }

    setInCall(false);
    setCallStatus("idle");
    setCallerName("");
    setCallerId(null);
    setCallerSignal(null);
    setCallAccepted(false);
    if (userVideoRef.current) userVideoRef.current.srcObject = null;
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
  };

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
            className={`text-sm ${
              isOnline(receiverId) ? "text-green-500" : "text-gray-500"
            }`}
          >
            {isOnline(receiverId) ? "Online" : ""}
          </p>
        </div>

        {!inCall && (
          <div className="flex-grow flex justify-end">
            <button
              onClick={handleCallUser}
              className="btn btn-sm btn-ghost text-white text-2xl"
            >
              📞
            </button>
          </div>
        )}
      </div>

      {/* Main content area */}
      {inCall ? (
        <div className="flex-1 flex flex-col justify-center items-center h-full w-full p-4 bg-gray-900 rounded-lg shadow-lg">
          <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black rounded-lg overflow-hidden border-2 border-gray-700 mb-4">
            <video
              className="w-full h-full object-contain"
              ref={myVideoRef}
              playsInline
              muted
              autoPlay
            />
            <div className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded-lg text-sm">
              You
            </div>
          </div>
          <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            <video
              className="w-full h-full object-contain"
              ref={userVideoRef}
              playsInline
              autoPlay
            />
            <div className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded-lg text-sm">
              {selectedUser?.fullName || callerName}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            {callStatus === "ringing" ? (
              <div className="flex items-center gap-4">
                {/* If incoming call (callerId present and not accepted) show accept/reject */}
                {!callAccepted && callerId ? (
                  <>
                    <button
                      onClick={handleAnswerCall}
                      className="btn btn-success rounded-full w-14 h-14 flex items-center justify-center p-2 text-3xl shadow-lg hover:shadow-xl transition-all"
                    >
                      📞
                    </button>
                    <button
                      onClick={() => endCall(true)}
                      className="btn btn-error rounded-full w-14 h-14 flex items-center justify-center p-2 text-3xl shadow-lg hover:shadow-xl transition-all"
                    >
                      📞
                    </button>
                  </>
                ) : (
                  // calling (outgoing) - show cancel
                  <button
                    onClick={() => endCall(true)}
                    className="btn btn-error rounded-full w-14 h-14 flex items-center justify-center p-2 text-3xl shadow-lg hover:shadow-xl transition-all"
                  >
                    📞
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => endCall(true)}
                className="btn btn-error rounded-full w-14 h-14 flex items-center justify-center p-2 text-3xl shadow-lg hover:shadow-xl transition-all"
              >
                📞
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Messages container */}
          <div className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
            <Messages message={message} />
          </div>

          {/* Message Input */}
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
      )}
    </div>
  );
};

export default Chatbox;
