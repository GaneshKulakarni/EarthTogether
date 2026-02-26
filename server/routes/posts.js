const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const router = express.Router();

// @route   GET api/posts
// @desc    Get all posts from all users (public feed)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let posts = await Post.find({ status: 'active' })
      .populate('user', ['username', 'ecoPoints', 'avatar'])
      .populate('comments.user', ['username'])
      .sort({ createdAt: -1 })
      .limit(50);

    // Clean up posts - handle null users and broken image URLs
    posts = posts.map(post => {
      const postObj = post.toObject ? post.toObject() : post;

      // If user reference is broken (null), provide a fallback
      if (!postObj.user) {
        postObj.user = { username: 'EcoMember', ecoPoints: 0, avatar: '' };
      }

      // Fix broken local image URLs
      if (postObj.imageUrl && (postObj.imageUrl.startsWith('/images/') || postObj.imageUrl.startsWith('images/'))) {
        postObj.imageUrl = ''; // Clear broken local paths
      }

      return postObj;
    });

    // If no posts in database, generate sample posts
    if (posts.length === 0) {
      const samplePosts = [
        { _id: '1', user: { username: 'EcoWarrior', ecoPoints: 1250 }, content: 'Just completed my 30-day plastic-free challenge! 🌱 Feeling amazing about reducing my environmental footprint. Who else is ready to join the movement?', category: 'Challenge', likes: [{}, {}, {}], comments: [{ user: { username: 'GreenThumb' }, content: 'Inspiring! I want to try this too!' }], shares: [], createdAt: new Date(Date.now() - 3600000) },
        { _id: '2', user: { username: 'SolarSarah', ecoPoints: 980 }, content: 'Installed solar panels on my roof today! ☀️ Expected to save 80% on electricity bills and reduce carbon footprint by 3 tons annually. Best investment ever!', category: 'Energy', likes: [{}, {}, {}, {}], comments: [], shares: [{}], createdAt: new Date(Date.now() - 7200000) },
        { _id: '3', user: { username: 'RecycleRaj', ecoPoints: 875 }, content: 'Started a community composting program in my neighborhood! 🌿 Already have 15 families participating. Small steps, big impact!', category: 'Community', likes: [{}, {}], comments: [{ user: { username: 'EcoMom' }, content: 'This is fantastic! How can we start one in our area?' }], shares: [], createdAt: new Date(Date.now() - 10800000) },
        { _id: '4', user: { username: 'BikeToWork', ecoPoints: 1100 }, content: 'Day 100 of biking to work! 🚴‍♂️ Saved 200kg CO2, lost 10kg weight, and feeling healthier than ever. Who says eco-living can\'t be fun?', category: 'Transport', likes: [{}, {}, {}, {}, {}], comments: [], shares: [{}, {}], createdAt: new Date(Date.now() - 14400000) },
        { _id: '5', user: { username: 'PlantBasedPro', ecoPoints: 950 }, content: 'Tried making plant-based burgers at home today! 🍔🌱 Delicious AND sustainable. Recipe in comments for anyone interested!', category: 'Food', likes: [{}, {}, {}], comments: [{ user: { username: 'VeggieLover' }, content: 'Yes please share the recipe!' }], shares: [], createdAt: new Date(Date.now() - 18000000) },
        { _id: '6', user: { username: 'WaterSaver', ecoPoints: 720 }, content: 'Installed a rainwater harvesting system! 💧 Collecting 500L per week for garden irrigation. Every drop counts in water conservation.', category: 'Water', likes: [{}, {}], comments: [], shares: [], createdAt: new Date(Date.now() - 21600000) },
        { _id: '7', user: { username: 'ZeroWasteZoe', ecoPoints: 1300 }, content: 'One month of zero waste living complete! ♻️ Generated only 1 jar of trash. It\'s challenging but so rewarding. AMA about zero waste tips!', category: 'Waste', likes: [{}, {}, {}, {}, {}, {}], comments: [{ user: { username: 'CuriousCarl' }, content: 'How do you handle food packaging?' }], shares: [{}, {}], createdAt: new Date(Date.now() - 25200000) },
        { _id: '8', user: { username: 'GreenGardener', ecoPoints: 650 }, content: 'Harvested my first batch of homegrown vegetables! 🥕🥬 Nothing beats the taste of organic, pesticide-free food from your own garden.', category: 'Gardening', likes: [{}, {}, {}], comments: [], shares: [], createdAt: new Date(Date.now() - 28800000) },
        { _id: '9', user: { username: 'CleanEnergyChris', ecoPoints: 1150 }, content: 'Switched to a 100% renewable energy provider today! ⚡ Small change, huge impact. Every household switching makes a difference!', category: 'Energy', likes: [{}, {}, {}, {}], comments: [{ user: { username: 'PowerSaver' }, content: 'Which provider did you choose?' }], shares: [], createdAt: new Date(Date.now() - 32400000) },
        { _id: '10', user: { username: 'EcoEducator', ecoPoints: 890 }, content: 'Taught 50 kids about climate change today! 🌍📚 Their enthusiasm gives me hope for the future. Education is our most powerful tool.', category: 'Education', likes: [{}, {}, {}, {}, {}], comments: [], shares: [{}, {}, {}], createdAt: new Date(Date.now() - 36000000) }
      ];
      posts = samplePosts;
    }

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, category, type, imageUrl } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new Post({
      user: req.user.id,
      content: content.trim(),
      type: type || 'general',
      category: category || 'General',
      imageUrl: imageUrl || ''
    });

    const post = await newPost.save();
    await post.populate('user', ['username', 'ecoPoints', 'avatar']);

    console.log('Post created successfully:', post._id);
    res.json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', ['username', 'ecoPoints']);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like/unlike a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', ['username', 'ecoPoints', 'avatar'])
      .populate('comments.user', ['username']);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if post has already been liked
    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);

    if (likeIndex > -1) {
      // Unlike - remove the like
      post.likes.splice(likeIndex, 1);
    } else {
      // Like - add the like
      post.likes.push({ user: req.user.id });
    }

    const savedPost = await post.save();
    console.log(`Post ${post._id} ${likeIndex > -1 ? 'unliked' : 'liked'} by user ${req.user.id}`);
    console.log('Saved post likes:', savedPost.likes.length);

    // Fetch fresh post from database to ensure data integrity
    const freshPost = await Post.findById(req.params.id)
      .populate('user', ['username', 'ecoPoints', 'avatar'])
      .populate('comments.user', ['username']);

    res.json(freshPost);
  } catch (err) {
    console.error('Error liking post:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:id', [
  auth,
  [check('content', 'Content is required').not().isEmpty()]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = {
      content: req.body.content,
      user: req.user.id,
      username: user.username,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    console.log(`Comment added to post ${post._id} by user ${user.username}`);
    res.json({ comments: post.comments, commentCount: post.comments.length });
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/posts/like/:id (alternative endpoint)
// @desc    Like/unlike a post
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if post has already been liked
    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);

    if (likeIndex > -1) {
      // Unlike - remove the like
      post.likes.splice(likeIndex, 1);
    } else {
      // Like - add the like
      post.likes.push({ user: req.user.id });
    }

    await post.save();
    console.log(`Post ${post._id} ${likeIndex > -1 ? 'unliked' : 'liked'} by user ${req.user.id}`);
    res.json({ likes: post.likes, likeCount: post.likes.length });
  } catch (err) {
    console.error('Error liking post:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/posts/share/:id
// @desc    Share a post
// @access  Private
router.post('/share/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if post has already been shared by this user
    if (!post.shares.some(share => share.user.toString() === req.user.id)) {
      post.shares.unshift({ user: req.user.id });
      await post.save();
    }

    res.json(post.shares);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/my-posts
// @desc    Get current user's posts
// @access  Private
router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id, status: 'active' })
      .populate('user', ['username', 'ecoPoints', 'avatar'])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
