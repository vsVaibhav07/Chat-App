import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.route('/send/:id').post(isAuthenticated,upload.single('file'), sendMessage);
router.route('/:id').get(isAuthenticated,getMessages);



export default router;