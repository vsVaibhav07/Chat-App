import mongoose from "mongoose";

 const connectDb= async ()=>{
    await mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("MongoDB connected successfully");
    }).catch((err)=>{
        console.error("MongoDB connection failed:", err);
    });
 }

 export default connectDb;
