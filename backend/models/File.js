// backend/models/File.js (UPDATED with thumbnailUrl field)

import mongoose from 'mongoose';

const fileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    cloudinaryUrl: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: true,
    },
    fileHash: { 
        type: String,
        required: true,
    },
    size: {
        type: Number, 
        required: true,
    },
    iv: { // Initialization Vector for Decryption
        type: String,
        required: true,
    },
    // 👇 NEW: Public URL for a small thumbnail (if generated)
    thumbnailUrl: {
        type: String,
        default: null,
    }, 
}, {
    timestamps: true,
});

const File = mongoose.model('File', fileSchema);
export default File;