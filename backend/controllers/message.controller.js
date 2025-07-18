import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId,io } from "../socket/socket.js";
 
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const {message,receiverId}=req.body;

        let getConversation=await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })
        if(!getConversation){
            getConversation=await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text:message
        });
        if(newMessage){
            getConversation.messages.push(newMessage._id);
            await Promise.all([
                getConversation.save(),
                newMessage.save()
            ]);
        }

        //SocketIO
        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage); 
            
        }

        return res.status(200).json({
            message: "Message sent successfully",
            success: true
        });
        
    } catch (error) {
        console.error("Error in sending message:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
        
    }
}


export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate("messages");

    res.status(200).json({
      messages: conversation ? conversation.messages : [],
      success: true
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
