// backend/models/SharedFile.js (NEW FILE)

import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

// Configuration for nanoid: 10 characters, using URL-friendly alphabet
// The shortId will look something like 'aB1c2D-3f'
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

const SharedFileSchema = mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
            unique: true,
            // Auto-generate a unique 10-character ID upon creation
            default: () => nanoid(), 
        },
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File', // Links to the actual file record
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        downloads: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            // Link expires in 7 days (604800000 milliseconds)
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        },
    },
    {
        timestamps: true,
    }
);

const SharedFile = mongoose.model('SharedFile', SharedFileSchema);

export default SharedFile;