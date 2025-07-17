import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import userRoutes from './routes/user.route.js';
import messageRoutes from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config({});

const app= express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const corsOption={
    origin:process.env.FRONTEND_URL,
    credentials:true
}
app.use(cors(corsOption));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);




app.listen(PORT,() => {
    connectDb();
    console.log(`Server is running on port ${PORT}`);
})