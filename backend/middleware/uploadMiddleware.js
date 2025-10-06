// backend/middleware/uploadMiddleware.js

import multer from 'multer';
import { Readable } from 'stream';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import { encryptFile } from '../utils/encryption.js'; 
import sharp from 'sharp';

// Multer storage: Use memoryStorage to get a buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

// Multer configuration with file limits
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit per file
    },
    fileFilter: (req, file, cb) => {
        // Allowed File Types
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx|pptx|txt|zip|mp4|mov|avi)$/i)) {
            return cb(new Error('Unsupported file type.'), false);
        }
        cb(null, true);
    }
});

// Helper function to upload a buffer stream to Cloudinary
const uploadStreamToCloudinary = (buffer, options, callback) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, callback);
    Readable.from(buffer).pipe(uploadStream);
}

// Helper function to check if file is an image that sharp can process
const isPreviewableImage = (mimetype) => {
    return mimetype.startsWith('image/') && !['image/svg+xml', 'image/gif'].includes(mimetype);
};


// 💡 MODIFIED COMBINED MIDDLEWARE: Handles Multiple Files
const uploadAndProcessFile = asyncHandler(async (req, res, next) => {
    
    // 1. Run Multer's middleware using .array('files', 10)
    await new Promise((resolve, reject) => {
        // 🛑 CHANGE: Use .array('files') to accept up to 10 files under the field name 'files'
        upload.array('files', 10)(req, res, (err) => { 
            if (err) {
                if (err instanceof multer.MulterError) {
                    return reject(new Error(`Upload Failed: ${err.message}`));
                }
                return reject(new Error(`Upload Error: ${err.message}`));
            }
            resolve();
        });
    });

    // 2. Critical Check: Ensure files were parsed successfully
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No files selected for upload. Check the input field name is "files".');
    }

    const fileDetailsList = [];
    
    // 3. Process each uploaded file
    for (const file of req.files) {
        
        // Calculate SHA256 Hash
        const hash = crypto.createHash('sha256');
        hash.update(file.buffer);
        const fileHash = hash.digest('hex');

        let thumbnailUrl = null;

        // --- OPTIONAL: GENERATE AND UPLOAD THUMBNAIL ---
        if (isPreviewableImage(file.mimetype)) {
            try {
                const thumbnailBuffer = await sharp(file.buffer)
                    .resize(100, 100, { fit: sharp.fit.inside, withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                
                const thumbnailResult = await new Promise((resolve, reject) => {
                    uploadStreamToCloudinary(
                        thumbnailBuffer,
                        { 
                            resource_type: 'image', 
                            folder: `file-storage-thumbnails/${req.user._id}`, 
                            public_id: `${fileHash}-thumb`,
                            overwrite: true,
                        },
                        (error, result) => {
                            if (error) reject(new Error('Thumbnail upload failed.'));
                            resolve(result);
                        }
                    );
                });
                thumbnailUrl = thumbnailResult.secure_url;

            } catch (error) {
                console.warn(`Could not generate thumbnail for ${file.originalname}: ${error.message}`);
            }
        }
        // --- END THUMBNAIL LOGIC ---


        // ENCRYPT THE FILE BUFFER
        const { encryptedBuffer, iv } = encryptFile(file.buffer);
        
        // Upload the ENCRYPTED file to Cloudinary
        const mainFileResult = await new Promise((resolve, reject) => {
            uploadStreamToCloudinary(
                encryptedBuffer,
                { 
                    resource_type: 'raw', 
                    folder: `file-storage/${req.user._id}`,
                    public_id: fileHash, 
                    overwrite: true,
                },
                (error, result) => {
                    if (error) reject(new Error('Main file upload failed.'));
                    resolve(result);
                }
            );
        });
        
        // Store details for the current file
        fileDetailsList.push({
            // Pass the original name (auto-incrementing will happen in the controller)
            fileName: file.originalname, 
            fileType: file.mimetype,
            cloudinaryUrl: mainFileResult.secure_url,
            cloudinaryId: mainFileResult.public_id,
            fileHash: fileHash,
            size: file.size, 
            iv: iv,
            thumbnailUrl: thumbnailUrl,
        });
    } // End of file loop
    
    // 🛑 CHANGE: Attach the entire list of file details to the request body
    req.body.fileDetailsList = fileDetailsList;
    
    next();
});


// Export ONLY the combined middleware function as 'upload'
export default {
    upload: uploadAndProcessFile,
    // The second export is included for compatibility with fileRoutes.js
    uploadFile: (req, res, next) => next() 
};