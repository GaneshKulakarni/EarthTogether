const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const router = express.Router();

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Manually resolve sender and post to avoid populate errors from deleted refs
    const User = require('../models/User');
    const Post = require('../models/Post');
    for (const n of notifications) {
      try {
        if (n.sender) {
          const u = await User.findById(n.sender).select('username').lean();
          n.sender = u || null;
        }
      } catch (_) { n.sender = null; }
      try {
        if (n.post) {
          const p = await Post.findById(n.post).select('content').lean();
          n.post = p || null;
        }
      } catch (_) { n.post = null; }
    }

    notifications = notifications.filter(n => n.sender != null);

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;