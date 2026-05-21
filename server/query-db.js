const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns');

// Fix DNS resolution for MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Load environment variables from parent folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in env!');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected! Fetching posts...');
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts:`);
    posts.forEach(p => {
      console.log({
        _id: p._id,
        user: p.user,
        content: p.content,
        status: p.status,
        createdAt: p.createdAt
      });
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
