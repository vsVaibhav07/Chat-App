import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const WebRTC = ({ selectedUser, onEnd }) => {
  const { socket } = useSelector((state) => state.socket);
  const authUser = useSelector((state) => state.user.authUser);

  const [peerConnection, setPeerConnection] = useState(null);
  const [stream, setStream] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);

  const myVideoRef = useRef();
  const userVideoRef = useRef();

  const createPeerConnection = (remoteId) => {
    const pc = new RTCPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.ontrack = (event) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          from: authUser.id,
          to: remoteId,
        });
      }
    };

    return pc;
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (myVideoRef.current) myVideoRef.current.srcObject = s;
      })
      .catch(() => {
        toast.error("Camera/Microphone permission denied");
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("callUser", ({ offer, from, name }) => {
      setCaller({ id: from, name });
      setCallerSignal(offer);
      setCallStatus("ringing");
      toast(`Incoming call from ${name}`);
    });

    socket.on("callAccepted", async ({ answer }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(answer))
        );
        setCallStatus("connected");
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("callEnded", () => {
      endCall(false);
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
    };
  }, [socket, peerConnection]);

  const callUser = async () => {
    if (!selectedUser || !stream) {
      toast.error("Select a user and allow camera/mic");
      return;
    }
    const pc = createPeerConnection(selectedUser._id);
    setPeerConnection(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("callUser", {
      offer: JSON.stringify(pc.localDescription),
      from: authUser.id,
      to: selectedUser._id,
      name: authUser.fullName,
    });

    setCallStatus("ringing");
  };

  const answerCall = async () => {
    if (!caller || !callerSignal) return;
    const pc = createPeerConnection(caller.id);
    setPeerConnection(pc);

    await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(callerSignal)));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answerCall", {
      answer: JSON.stringify(pc.localDescription),
      from: authUser.id,
      to: caller.id,
    });

    setCallStatus("connected");
  };

  const endCall = (emit = true) => {
    if (peerConnection) peerConnection.close();
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (emit && (selectedUser || caller)) {
      socket.emit("callEnded", {
        from: authUser.id,
        to: selectedUser?._id || caller.id,
      });
    }
    setPeerConnection(null);
    setStream(null);
    setCallStatus("idle");
    setCaller(null);
    setCallerSignal(null);
    if (onEnd) onEnd();
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 bg-gray-900">
      <div className="flex w-full gap-4">
        <video ref={myVideoRef} autoPlay muted playsInline className="w-1/2 rounded-lg bg-black" />
        <video ref={userVideoRef} autoPlay playsInline className="w-1/2 rounded-lg bg-black" />
      </div>
      <div className="mt-4 flex gap-4">
        {callStatus === "idle" && (
          <button onClick={callUser} className="btn btn-primary">📞 Call</button>
        )}
        {callStatus === "ringing" && caller && (
          <>
            <button onClick={answerCall} className="btn btn-success">✅ Answer</button>
            <button onClick={() => endCall()} className="btn btn-error">❌ Reject</button>
          </>
        )}
        {callStatus === "connected" && (
          <button onClick={() => endCall()} className="btn btn-error">🔴 End</button>
        )}
      </div>
    </div>
  );
};

export default WebRTC;
