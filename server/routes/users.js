const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get logged in user profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
