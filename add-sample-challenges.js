const mongoose = require('mongoose');
const Challenge = require('./server/models/Challenge');
const User = require('./server/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/earthtogether', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleChallenges = [
  {
    title: "Zero Waste Week",
    description: "Reduce your waste to zero for an entire week by reusing, recycling, and avoiding single-use items.",
    category: "Waste Reduction",
    difficulty: "Medium",
    duration: 7,
    ecoPoints: 150,
    carbonSaved: 5.2,
    requirements: [
      "Use reusable bags for shopping",
      "Avoid single-use plastics",
      "Compost organic waste",
      "Recycle properly"
    ],
    rewards: [
      "150 eco-points",
      "Zero Waste Champion badge",
      "5.2kg CO2 saved"
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    title: "Green Commute Challenge",
    description: "Use eco-friendly transportation methods for your daily commute for 2 weeks.",
    category: "Transportation",
    difficulty: "Easy",
    duration: 14,
    ecoPoints: 200,
    carbonSaved: 15.8,
    requirements: [
      "Walk, bike, or use public transport",
      "Avoid private car usage",
      "Track your daily commute",
      "Share progress photos"
    ],
    rewards: [
      "200 eco-points",
      "Green Commuter badge",
      "15.8kg CO2 saved"
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    title: "Energy Saver Month",
    description: "Reduce your home energy consumption by 20% over the course of a month.",
    category: "Energy",
    difficulty: "Hard",
    duration: 30,
    ecoPoints: 300,
    carbonSaved: 25.0,
    requirements: [
      "Use LED bulbs only",
      "Unplug devices when not in use",
      "Optimize heating/cooling",
      "Monitor energy usage daily"
    ],
    rewards: [
      "300 eco-points",
      "Energy Master badge",
      "25kg CO2 saved"
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active'
  }
];

async function addSampleChallenges() {
  try {
    // Get the first user to set as creator
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    // Check if challenges already exist
    const existingChallenges = await Challenge.find();
    if (existingChallenges.length > 0) {
      console.log('Challenges already exist in database.');
      return;
    }

    // Add createdBy field to each challenge
    const challengesWithCreator = sampleChallenges.map(challenge => ({
      ...challenge,
      createdBy: user._id
    }));

    // Insert sample challenges
    const challenges = await Challenge.insertMany(challengesWithCreator);
    console.log(`Added ${challenges.length} sample challenges to database.`);
    
    challenges.forEach(challenge => {
      console.log(`- ${challenge.title} (${challenge.difficulty})`);
    });

  } catch (error) {
    console.error('Error adding sample challenges:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleChallenges();