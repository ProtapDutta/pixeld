// backend/models/User.js (UPDATED)

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // 💡 NEW IMPORT

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    // 💡 NEW FIELDS FOR PASSWORD RESET
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Check if the password field is modified (or if it's a new document)
    // IMPORTANT: Also check for the resetPasswordToken modification to allow token saving 
    // without re-hashing the password if it hasn't changed.
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 💡 NEW METHOD TO GENERATE AND SAVE RESET TOKEN
/**
 * Generates and saves a hashed reset token to the user document.
 * @returns {string} The unhashed, raw token (to be sent via email).
 */
userSchema.methods.getResetPasswordToken = function () {
    // Generate a secure, unhashed token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token before saving it to the database for security
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set the token to expire in 24 hours (24 * 60 * 60 * 1000 milliseconds)
    this.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;

    // Return the unhashed token to be used in the email link
    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;