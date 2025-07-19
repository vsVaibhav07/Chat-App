import express from 'express';
import { register,login, logout, getOtherUsers, editProfile } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';


const router=express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/').get(isAuthenticated, getOtherUsers);
router.route('/editProfile').post(isAuthenticated,upload.single('profilePhoto'), editProfile);


export default router;