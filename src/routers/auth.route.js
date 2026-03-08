import express from 'express';
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAll,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login',        loginUser);
router.post('/refresh',      refreshAccessToken);   
router.post('/logout',       logoutUser);         
router.post('/logout-all',   authMiddleware, logoutAll); 

export default router;