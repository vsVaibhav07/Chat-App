import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  setCallStatus,
  setIncoming,
  setLocalStream,
  setRemoteStream,
  setSelectedCallUser,
  resetCall,
} from "../redux/webRTCSlice";

const useWebRTC = () => {
  const { socket } = useSelector((state) => state.socket);
  const authUser = useSelector((state) => state.user.authUser);
  const selectedUser = useSelector((state) => state.otherUsers.selectedUser);
  const dispatch = useDispatch();
  const { callStatus, incoming, localStream, remoteStream, selectedCallUser } =
    useSelector((state) => state.webRTC);

  const [pc, setPc] = useState(null);
  const candidateQueueRef = useRef([]);

  const createPeer = (remoteId, stream) => {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (stream) {
      stream.getTracks().forEach((track) => connection.addTrack(track, stream));
    }

    connection.ontrack = (ev) => dispatch(setRemoteStream(ev.streams[0]));

    connection.onicecandidate = (ev) => {
      if (ev.candidate) {
        socket.emit("iceCandidate", {
          candidate: ev.candidate,
          from: authUser.id,
          to: remoteId,
        });
      }
    };

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "connected")
        dispatch(setCallStatus("connected"));
      if (["disconnected", "failed"].includes(connection.connectionState))
        endCall(false);
    };

    return connection;
  };

  // Start call
  const startCall = async () => {
    if (!selectedUser) return toast.error("Select a user to call");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      dispatch(setLocalStream(stream));
      dispatch(setSelectedCallUser(selectedUser));

      const connection = createPeer(selectedUser._id, stream);
      setPc(connection);

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socket.emit("callUser", {
        offer: JSON.stringify(connection.localDescription),
        from: authUser.id,
        to: selectedUser._id,
        name: authUser.fullName,
      });

      dispatch(setCallStatus("ringing"));
    } catch (err) {
      toast.error("Camera/Microphone permission denied");
      console.error(err);
    }
  };

  // Answer call
  const answerIncoming = async () => {
    if (!incoming) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      dispatch(setLocalStream(stream));
      dispatch(setSelectedCallUser({ _id: incoming.from, fullName: incoming.name }));

      const connection = createPeer(incoming.from, stream);
      setPc(connection);

      await connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(incoming.offer)));

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      socket.emit("answerCall", {
        answer: JSON.stringify(connection.localDescription),
        from: authUser.id,
        to: incoming.from,
      });

      dispatch(setIncoming(null));
      dispatch(setCallStatus("connected"));
    } catch (err) {
      toast.error("Camera/Microphone permission denied");
    }
  };

  const endCall = (emit = true) => {
    if (pc) pc.close();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());

    if (emit && (selectedCallUser || incoming)) {
      socket.emit("callEnded", {
        from: authUser.id,
        to: selectedCallUser?._id || incoming?.from,
      });
    }

    setPc(null);
    candidateQueueRef.current = [];
    dispatch(resetCall());
  };

  useEffect(() => {
    if (!socket) return;

    const onCallUser = ({ offer, from, name }) => {
      dispatch(setIncoming({ from, name, offer }));
      dispatch(setCallStatus("ringing"));
      toast(`${name} is calling you...`);
    };

    const onCallAccepted = async ({ answer }) => {
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
      dispatch(setCallStatus("connected"));
    };

    const onIceCandidate = async ({ candidate }) => {
      if (candidate) {
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        else candidateQueueRef.current.push(candidate);
      }
    };

    const onCallEnded = () => endCall(false);

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
  }, [socket, pc]);

  useEffect(() => {
    if (pc && candidateQueueRef.current.length) {
      candidateQueueRef.current.forEach(async (c) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      });
      candidateQueueRef.current = [];
    }
  }, [pc]);

  return { localStream, remoteStream, callStatus, incoming, startCall, answerIncoming, endCall };
};

export default useWebRTC;
