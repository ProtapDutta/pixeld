// backend/routes/authRoutes.js (UPDATED & FIXED)

import express from 'express';
import { 
    registerUser, 
    loginUser,
    forgotPassword,              // Existing 
    validateTokenAndSetNewPassword, // 💡 NEW CONTROLLER
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// NEW ROUTES FOR PASSWORD RESET
router.post('/forgotpassword', forgotPassword); 

// 💡 CRITICAL CHANGE: This is a PUT request to update the password.
router.put('/resetpassword/:token', validateTokenAndSetNewPassword); 

export default router;