const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
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
        { _id: '10', user: { username: 'EcoEducator', ecoPoints: 890 }, content: 'Taught 50 kids about climate change today! 🌍📚 Their enthusiasm gives me hope for the future. Education is our most powerful tool.', category: 'Education', likes: [{}, {}, {}, {}, {}], comments: [], shares: [{}, {}, {}], createdAt: new Date(Date.now() - 36000000) },
        { _id: '11', user: { username: 'SustainableSam', ecoPoints: 780 }, content: 'DIY natural cleaning products workshop was a success! 🧽✨ 20 people learned to make eco-friendly cleaners. No more toxic chemicals!', category: 'DIY', likes: [{}, {}], comments: [{ user: { username: 'CleanLiving' }, content: 'Can you share the recipes?' }], shares: [], createdAt: new Date(Date.now() - 39600000) },
        { _id: '12', user: { username: 'TreeHugger', ecoPoints: 1050 }, content: 'Planted 25 trees in the local park today! 🌳 Community tree planting events are so rewarding. Each tree will absorb 22kg CO2 annually!', category: 'Conservation', likes: [{}, {}, {}, {}, {}, {}], comments: [], shares: [{}, {}], createdAt: new Date(Date.now() - 43200000) },
        { _id: '13', user: { username: 'MinimalMaya', ecoPoints: 920 }, content: 'Embracing minimalism has reduced my carbon footprint by 40%! 📦➡️♻️ Buying less, living more. Quality over quantity always wins.', category: 'Lifestyle', likes: [{}, {}, {}], comments: [{ user: { username: 'SimpleLife' }, content: 'Minimalism changed my life too!' }], shares: [], createdAt: new Date(Date.now() - 46800000) },
        { _id: '14', user: { username: 'RepairCafe', ecoPoints: 680 }, content: 'Fixed 15 electronic devices at our monthly repair café! 🔧💻 Keeping electronics out of landfills, one repair at a time.', category: 'Repair', likes: [{}, {}], comments: [], shares: [], createdAt: new Date(Date.now() - 50400000) },
        { _id: '15', user: { username: 'EcoCommuter', ecoPoints: 850 }, content: 'Carpooling to work has been amazing! 🚗👥 Reduced fuel costs by 75% and made new friends. Sustainable AND social!', category: 'Transport', likes: [{}, {}, {}], comments: [{ user: { username: 'ShareRide' }, content: 'How did you find carpool partners?' }], shares: [], createdAt: new Date(Date.now() - 54000000) },
        { _id: '16', user: { username: 'BeachCleanup', ecoPoints: 1200 }, content: 'Organized beach cleanup collected 200kg of plastic waste! 🏖️🗑️ 50 volunteers showed up. Together we can heal our oceans!', category: 'Cleanup', likes: [{}, {}, {}, {}, {}, {}, {}], comments: [], shares: [{}, {}, {}], createdAt: new Date(Date.now() - 57600000) },
        { _id: '17', user: { username: 'UrbanFarmer', ecoPoints: 750 }, content: 'Vertical garden in my apartment is thriving! 🏢🌿 Growing herbs and vegetables in 2 square meters. Urban farming is the future!', category: 'Gardening', likes: [{}, {}, {}], comments: [{ user: { username: 'CityGreen' }, content: 'What vegetables grow best vertically?' }], shares: [], createdAt: new Date(Date.now() - 61200000) },
        { _id: '18', user: { username: 'GreenTech', ecoPoints: 990 }, content: 'Smart home automation reduced energy consumption by 30%! 🏠💡 LED lights, smart thermostats, and energy monitoring make a difference.', category: 'Technology', likes: [{}, {}, {}, {}], comments: [], shares: [{}], createdAt: new Date(Date.now() - 64800000) },
        { _id: '19', user: { username: 'EcoFashion', ecoPoints: 820 }, content: 'Thrift shopping haul! 👗♻️ Found amazing clothes for 90% less cost and environmental impact. Sustainable fashion is stylish fashion!', category: 'Fashion', likes: [{}, {}, {}], comments: [{ user: { username: 'StyleSaver' }, content: 'Love thrift finds! Where do you shop?' }], shares: [], createdAt: new Date(Date.now() - 68400000) },
        { _id: '20', user: { username: 'RenewableRavi', ecoPoints: 1180 }, content: 'Wind turbine project in our town approved! 💨⚡ Will generate clean energy for 5000 homes. Community action creates real change!', category: 'Energy', likes: [{}, {}, {}, {}, {}, {}], comments: [], shares: [{}, {}, {}], createdAt: new Date(Date.now() - 72000000) }
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
    const { content, category } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new Post({
      user: req.user.id,
      content: content.trim(),
      category: category || 'General'
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

    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/posts/like/:id
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

module.exports = router;
