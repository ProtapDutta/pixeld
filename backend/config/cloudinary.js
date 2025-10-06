// backend/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';

export const initializeCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });
        console.log('Cloudinary configuration complete.');
    } catch (error) {
        console.error('Error configuring Cloudinary:', error.message);
    }
};

export default cloudinary;