const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from parent directory's .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in env!');
  process.exit(1);
}

async function seedUser() {
  try {
    console.log('Connecting to MongoDB using URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected successfully!');

    const email = 'sureshyadhav@gmail.com';
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log(`User ${email} already exists. Updating password...`);
      user.password = 'suresh123';
      await user.save();
      console.log('Password updated successfully!');
    } else {
      console.log(`Creating user ${email}...`);
      user = new User({
        username: 'sureshyadhav',
        email: email.toLowerCase(),
        password: 'suresh123',
        joinedAt: new Date()
      });
      await user.save();
      console.log('User created successfully!');
    }
  } catch (err) {
    console.error('Error seeding user:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedUser();
