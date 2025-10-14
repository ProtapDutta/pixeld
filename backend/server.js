// backend/server.js (WITH DEBUG LOGGING)

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

// 💡 NEW DEBUG LOGGING SECTION
console.log('--- VERCEL ENV CHECK ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL (Vercel Setting):', process.env.FRONTEND_URL); 
console.log('------------------------');
// -----------------------------------

const app = express();

// 💡 NEW: Simple Health Check Route to handle 'Cannot GET /'
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Pixel Drive API is running successfully! CORS CHECK V2.0', 
        status: 'OK',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 💡 DYNAMIC CORS CONFIGURATION FOR LOCAL AND PRODUCTION
// Uses either FRONTEND_URL or CLIENT_URL (whichever is set in Vercel/local .env)
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
        // Allow requests with no origin (e.g., cURL, server-to-server) or from allowed origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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