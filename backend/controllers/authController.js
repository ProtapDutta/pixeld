// backend/controllers/authController.js (UPDATED & FIXED)

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js'; 
import crypto from 'crypto'; 

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        userName,
        email,
        password,
    });

    if (user) {
        // Prepare clean user object for response (NO PASSWORD)
        const userResponse = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
        };

        res.status(201).json({
            user: userResponse,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); 

    // Check user and password
    if (user && (await user.matchPassword(password))) {
        // Prepare clean user object for response (NO PASSWORD)
        const userResponse = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
        };

        // 🛑 CRITICAL: Return the clean object and token
        res.status(200).json({
            user: userResponse,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// ----------------------------------------------------------------
// 💡 PASSWORD RESET CONTROLLERS
// ----------------------------------------------------------------

// @desc    Request password reset link
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({ 
            message: 'If a user with that email exists, a password reset link has been sent to them.',
        });
    }

    // 1. Generate and save the reset token
    const resetToken = user.getResetPasswordToken(); 
    await user.save({ validateBeforeSave: false }); 

    // 2. Create the reset URL 
    // 💡 POINTS TO THE FRONTEND ROUTE (/reset-password/:token)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>Pixel Drive Password Reset Request</h1>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the button below to **set a new password**. **This link will expire in 24 hours.**</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Set New Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Alternatively, you can copy and paste the following link into your browser: <br/> ${resetUrl}</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request for Pixel Drive',
            html: message,
        });

        res.status(200).json({
            message: 'If a user with that email exists, a password reset link has been sent to them.',
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error('Email could not be sent. Please check SMTP configuration.');
    }
});

// @desc    Validate token and update user's password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
export const validateTokenAndSetNewPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    
    // 1. Hash the unhashed token from the URL to match the hashed token saved in the DB
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // 2. Find the user with the matching hashed token and an unexpired date
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired password reset token.');
    }
    
    if (!password || password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long.');
    }

    // 3. Token is valid: Set the new password and clear the token fields
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save(); // Pre-save hook hashes the new password

    res.status(200).json({
        message: 'Password successfully updated.',
    });
});