// backend/server.js 

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

// 💡 REFINEMENT: Use CLIENT_URL from your .env for local CORS
const allowedOrigins = [
    process.env.CLIENT_URL,      // Reads http://localhost:5173 from your .env
    'http://localhost:3000',     // Common fallback local port
    process.env.FRONTEND_URL,    // This will be undefined locally (which is fine)
];

const corsOptions = {
    origin: (origin, callback) => {
        // If the origin is not present (e.g., local server-to-server or script requests) 
        // OR it's in our list of allowed origins, allow it.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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