const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// @route   POST api/upload
// @desc    Upload image or video to Cloudinary
// @access  Private
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Cloudinary returns the URL in req.file.path or req.file.secure_url
    res.json({ 
      url: req.file.path || req.file.secure_url,
      resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
