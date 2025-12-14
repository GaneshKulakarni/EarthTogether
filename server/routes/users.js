const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Ensure uploads/avatars directory exists
const avatarDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Multer storage and filters for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { username, bio, location, education, institution } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (institution !== undefined) user.institution = institution;
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/search
// @desc    Search users by username
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user.id }
    })
      .select('username avatar bio')
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/:userId/follow
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const isFollowing = currentUser.following.includes(req.params.userId);
    
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
    } else {
      currentUser.following.push(req.params.userId);
      targetUser.followers.push(req.user.id);
    }
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({ following: !isFollowing });
  } catch (err) {
    console.error('Error toggling follow:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/leaderboard
// @desc    Get leaderboard of all users sorted by points
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { sortBy = 'ecoPoints' } = req.query;
    
    let sortField = 'ecoPoints';
    if (sortBy === 'streaks') sortField = 'currentStreak';
    if (sortBy === 'impact') sortField = 'totalCarbonSaved';
    
    const users = await User.find({})
      .select('username ecoPoints currentStreak totalCarbonSaved')
      .sort({ [sortField]: -1 })
      .limit(100);
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
