import { Server } from "socket.io";
import http from "http";

const userSocketMap = {};

export const getSocketId = (userId) => {
  return userSocketMap[userId];
};

let io;

const setupSocket = (app) => {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`✅ User connected: ${userId} (${socket.id})`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
        console.log(`❌ User disconnected: ${userId}`);
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    
    socket.on("callUser", ({ offer, to, from, name }) => {

      const receiverSocketId = getSocketId(to);
      console.log("📞 callUser event:", { from, to }); 
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callUser", { offer, from, name });
        console.log(`📞 Call offer from ${from} to ${to}`);
      } else {
        console.log(`⚠️ User ${to} is not connected!`);
      }
    });

   
    socket.on("answerCall", ({ answer, to, from }) => {
      const callerSocketId = getSocketId(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", { answer, from });
        console.log(`✅ Call answered by ${from} for ${to}`);
      } else {
        console.log(`⚠️ User ${to} is not connected!`);
      }
    });

  
    socket.on("iceCandidate", ({ candidate, to, from }) => {
      const targetSocketId = getSocketId(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("iceCandidate", { candidate, from });
        console.log(`🧊 ICE candidate sent from ${from} to ${to}`);
      } else {
        console.log(`⚠️ User ${to} is not connected!`);
      }
    });

 
    socket.on("callEnded", ({ to }) => {
      const receiverSocketId = getSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callEnded", { from: userId });
        console.log(`🔴 Call ended by ${userId} for ${to}`);
      } else {
        console.log(`⚠️ User ${to} is Offline!`);
      }
    });

   
    socket.on("sendMessage", ({ to, message }) => {
      const receiverSocketId = getSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", { from: userId, message });
        console.log(`💬 Message from ${userId} to ${to}: ${message}`);
      }
    });
  });

  return { server, io };
};

export { setupSocket, io };
