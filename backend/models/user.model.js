import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    profilePhoto:{
        type:String,
        default:"",
    },
    gender:{
        type:String,
        enum:["male","female"],
        required:true,
    },
    bio:{
        type:String,
        default:"Hey there ,Let's start Chatting"
    }
},{ timestamps: true });
export default mongoose.model("User",userSchema);