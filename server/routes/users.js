const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// @route   GET /api/users/profile
// @desc    Get logged in user profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/users/profile
// @desc    Update profile info and optional avatar upload
// @access  Private
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const updates = {
        username: req.body.username,
        bio: req.body.bio,
      };

      if (req.file) {
        const relativePath = `/uploads/avatars/${req.file.filename}`;
        updates.avatar = relativePath;
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-password");

      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error.message);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

module.exports = router;
