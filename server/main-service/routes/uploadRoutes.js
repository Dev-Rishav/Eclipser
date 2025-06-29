const express = require('express');
const multer = require('multer');
const { updateUserProfile } = require('../controllers/uploadController.js');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for Cloudinary processing
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});


// Update profile route with authentication and file handling
router.patch(
  '/profile/:userId',
  authMiddleware, // Add authentication
  upload.single('avatar'),    // Handle single file upload with field name 'avatar'
  updateUserProfile           // Controller function
);

module.exports = router;