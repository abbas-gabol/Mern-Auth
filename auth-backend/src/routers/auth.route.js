import express from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAll,
  checkEmailExists,
  forgotPassword,
  resetPassword,
  googleSignIn,
  changePassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/register',         registerUser);
router.post('/login',            loginUser);
router.post('/google-signin',    googleSignIn);
router.post('/refresh',          refreshAccessToken);   
router.post('/logout',           logoutUser);         
router.post('/logout-all',       authMiddleware, logoutAll);
router.post('/check-email',      checkEmailExists);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.post('/change-password',  authMiddleware, changePassword);

export default router;