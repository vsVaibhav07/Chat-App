import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import userRoutes from './routes/user.route.js';
import messageRoutes from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {setupSocket} from './socket/socket.js'; 
import createAssistant from './config/createAssistant.js';

dotenv.config();

const app = express(); // ✅ ONE EXPRESS APP

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
app.use(cors(corsOptions));

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Backend is running!' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Backend is healthy!' });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);

await connectDb();
await createAssistant()

// ✅ Setup socket with same app
const { server } = setupSocket(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
