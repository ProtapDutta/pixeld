// backend/server.js (FINAL DEPLOYMENT FIX)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initializeCloudinary } from './config/cloudinary.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();
connectDB();
initializeCloudinary(); 

const app = express();

// 💡 DYNAMIC CORS CONFIGURATION FOR LOCAL AND PRODUCTION
// This uses a single environment variable, which MUST be set on Vercel.
const deployedFrontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;

const allowedOrigins = [
    // 1. Local Development URLs
    'http://localhost:5173', 
    'http://localhost:3000', 
    // 2. Deployed Production URL (MUST be set in Vercel Environment Variables)
    deployedFrontendUrl,
];

const corsOptions = {
    origin: (origin, callback) => {
        // If the request origin is undefined (e.g., local server-to-server or scripts), allow it.
        // OR if the origin is in our allowed list, allow it.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log the disallowed origin for debugging
            console.error(`CORS rejected origin: ${origin}`); 
            callback(new Error(`CORS policy restricts access for origin: ${origin}`));
        }
    },
    credentials: true,
};

// Middleware
app.use(cors(corsOptions)); // Use the dynamic CORS options
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Simple Error Handler 
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(err.status || 500).json({
   message: err.message || 'Server Error',
   stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));