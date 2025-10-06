// backend/server.js (FIXED: Removing obsolete share routes)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initializeCloudinary } from './config/cloudinary.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
// 💡 REMOVED: import shareRoutes from './routes/shareRoutes.js'; 

dotenv.config();
connectDB();
initializeCloudinary(); // Initialize Cloudinary

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser for raw JSON data
app.use(express.urlencoded({ extended: false })); // Body parser for form data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
// 💡 REMOVED: app.use('/api/share', shareRoutes); 

// Simple Error Handler (For async-handler errors)
app.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(err.status || 500).json({
 message: err.message || 'Server Error',
 stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));