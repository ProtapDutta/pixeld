// backend/routes/fileRoutes.js (FIXED: Added Rename Route)

import express from 'express';
import { 
uploadFile, 
getFiles, 
downloadFile, 
deleteFile,
deleteMultipleFiles,
getPublicSharedFile,
renameFile // 💡 NEW: Import the rename controller
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import uploadMiddleware from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- PROTECTED ROUTES (Require Auth Token) ---

// Route for file upload
router.route('/upload').post(
protect, 
uploadMiddleware.upload, 
uploadFile
);

// Route for bulk deletion
router.route('/delete-many').post(protect, deleteMultipleFiles); 

// Main routes for fetching, single deletion, and download
router.route('/')
.get(protect, getFiles);

// 💡 RENAME ROUTE: PROTECTED
router.route('/rename/:id')
 .patch(protect, renameFile); // ⬅️ CHANGE from .put to .patch

router.route('/:id')
.delete(protect, deleteFile);

router.route('/download/:id')
.get(protect, downloadFile);


// --- PUBLIC ROUTE: Unauthenticated Access ---

// NEW PUBLIC SHARING ROUTE: Uses file ID for permanent access to decrypted file
router.route('/public/share/:fileId')
 .get(getPublicSharedFile);

export default router;