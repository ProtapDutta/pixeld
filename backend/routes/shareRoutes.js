// backend/routes/shareRoutes.js (NEW FILE - Public Download Route)

import express from 'express';
// We only need the public download controller here
import { downloadSharedFile } from '../controllers/fileController.js'; 

const router = express.Router();

// Public route to handle the short link and redirect to the file
// This route does NOT use the 'protect' middleware.
router.get('/:shortId', downloadSharedFile); 

export default router;