import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiX, FiPhone, FiPhoneOff } from "react-icons/fi";

const WebRTCModal = ({ selectedUser, open, setOpen }) => {
  const { socket } = useSelector((state) => state.socket);
  const authUser = useSelector((state) => state.user.authUser);

  const [pc, setPc] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [incoming, setIncoming] = useState(null);
  const candidateQueueRef = useRef([]);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Debug auth user
  useEffect(() => {
    console.log("🧑 Auth user:", authUser);
  }, [authUser]);

  const createPeer = (remoteId) => {
    console.log("🛠 Creating peer connection with", remoteId);
    const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    const connection = new RTCPeerConnection(configuration);

    if (localStream) {
      console.log("🎥 Adding local tracks to peer connection");
      localStream.getTracks().forEach((t) => connection.addTrack(t, localStream));
    }

    connection.ontrack = (ev) => {
      console.log("🎞 Remote track received:", ev.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
    };

    connection.onicecandidate = (ev) => {
      if (ev.candidate) {
        console.log("🧊 Sending ICE candidate", ev.candidate);
        socket.emit("iceCandidate", {
          candidate: ev.candidate,
          from: authUser.id,
          to: remoteId,
        });
      }
    };

    connection.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", connection.connectionState);
      if (connection.connectionState === "connected") setCallStatus("connected");
      if (["disconnected", "failed"].includes(connection.connectionState)) endCall(false);
    };

    return connection;
  };

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (!mounted) return;
        console.log("🎤 Local stream obtained");
        setLocalStream(s);
        if (myVideoRef.current) myVideoRef.current.srcObject = s;
      })
      .catch(() => toast.error("Camera/Microphone permission denied"));
    return () => (mounted = false);
  }, []);

  // Socket listeners for caller and receiver
  useEffect(() => {
    if (!socket) return;

    const onCallUser = ({ offer, from, name }) => {
      console.log("📞 Incoming callUser event received!");
      console.log("From:", from, "Name:", name, "Offer:", offer);
      setIncoming({ from, name, offer });
      setCallStatus("ringing");
      toast(`${name} is calling you...`);
    };

    const onCallAccepted = async ({ answer }) => {
      console.log("✅ callAccepted event received. Answer:", answer);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
          console.log("🌐 Remote description applied successfully");
          setCallStatus("connected");
        } catch (e) {
          console.error("❌ Error applying remote answer:", e);
        }
      }
    };

    const onIceCandidate = async ({ candidate, from }) => {
      console.log("🧊 ICE candidate received from", from, candidate);
      if (candidate) {
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ ICE candidate added");
          } catch (e) {
            console.warn("⚠️ Queueing ICE candidate", e);
            candidateQueueRef.current.push(candidate);
          }
        } else {
          console.log("⚠️ PC not ready, queueing ICE candidate");
          candidateQueueRef.current.push(candidate);
        }
      }
    };

    const onCallEnded = () => {
      console.log("📴 callEnded event received");
      endCall(false);
    };

    socket.on("callUser", onCallUser);
    socket.on("callAccepted", onCallAccepted);
    socket.on("iceCandidate", onIceCandidate);
    socket.on("callEnded", onCallEnded);

    return () => {
      socket.off("callUser", onCallUser);
      socket.off("callAccepted", onCallAccepted);
      socket.off("iceCandidate", onIceCandidate);
      socket.off("callEnded", onCallEnded);
    };
  }, [socket, pc, localStream]);

  useEffect(() => {
    const applyQueued = async () => {
      if (pc && candidateQueueRef.current.length > 0) {
        for (const c of candidateQueueRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
            console.log("✅ Queued ICE candidate applied", c);
          } catch (e) {
            console.warn("❌ Failed queued candidate", e);
          }
        }
        candidateQueueRef.current = [];
      }
    };
    applyQueued();
  }, [pc]);

  const startCall = async () => {
    if (!selectedUser) return toast.error("Select a user to call");
    if (!localStream) return toast.error("Allow camera & mic first");

    const connection = createPeer(selectedUser._id);
    setPc(connection);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    console.log("📤 Call offer created and local description set:", offer);

    socket.emit("callUser", {
      offer: JSON.stringify(connection.localDescription),
      from: authUser.id,
      to: selectedUser._id,
      name: authUser.fullName,
    });

    setCallStatus("ringing");
  };

  const answerIncoming = async () => {
    if (!incoming) return;
    const connection = createPeer(incoming.from);
    setPc(connection);

    await connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(incoming.offer)));
    console.log("🌐 Remote description set for incoming call");

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    console.log("📤 Answer created and local description set", answer);

    socket.emit("answerCall", {
      answer: JSON.stringify(connection.localDescription),
      from: authUser.id,
      to: incoming.from,
    });

    setIncoming(null);
    setCallStatus("connected");
  };

  const endCall = (emit = true) => {
    console.log("📴 Ending call");
    if (pc) pc.close();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());

    if (emit && (selectedUser || incoming)) {
      socket.emit("callEnded", {
        from: authUser.id,
        to: selectedUser?._id || incoming?.from,
      });
    }

    setPc(null);
    setLocalStream(null);
    setCallStatus("idle");
    setIncoming(null);
    candidateQueueRef.current = [];
    setOpen(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") endCall(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pc, localStream]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => endCall(false)} />
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              <img src={selectedUser?.profilePhoto} alt="peer" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-white font-semibold">{selectedUser?.fullName}</div>
              <div className="text-xs text-gray-400">
                {callStatus === "connected" ? "In call" : callStatus === "ringing" ? "Ringing..." : "Ready to call"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => endCall(false)} className="btn btn-ghost text-white btn-sm">
              <FiX /> Close
            </button>
          </div>
        </div>

        {/* video area */}
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1 bg-black rounded-lg relative overflow-hidden">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[60vh] object-cover" />
            {callStatus !== "connected" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white opacity-80">
                  <div className="text-2xl">{callStatus === "ringing" ? "Waiting for answer..." : "No active call"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="w-56 flex flex-col gap-3">
            <div className="bg-gray-800 rounded-lg p-2 flex items-center justify-center">
              <video ref={myVideoRef} muted autoPlay playsInline className="w-full h-40 object-cover rounded-md" />
            </div>

            <div className="flex flex-col gap-2">
              {callStatus === "idle" && (
                <button onClick={startCall} className="btn btn-primary w-full flex items-center justify-center gap-2">
                  <FiPhone /> Start Call
                </button>
              )}
              {callStatus === "ringing" && incoming && (
                <>
                  <button onClick={answerIncoming} className="btn btn-success w-full">Answer</button>
                  <button onClick={() => endCall()} className="btn btn-error w-full">Reject</button>
                </>
              )}
              {callStatus === "ringing" && !incoming && <div className="text-sm text-gray-300 text-center">Calling...</div>}
              {callStatus === "connected" && (
                <>
                  <div className="text-sm text-gray-300 text-center">Call connected</div>
                  <button onClick={() => endCall()} className="btn btn-danger w-full"><FiPhoneOff /> End Call</button>
                </>
              )}
              <div className="text-xs text-gray-400 mt-2">Tip: click outside or press Esc to close (this will end the call).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRTCModal;
