const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  ecoPoints: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCarbonSaved: {
    type: Number,
    default: 0
  },
  totalWasteReduced: {
    type: Number,
    default: 0
  },
  totalEnergySaved: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  certifications: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    level: String
  }],
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add eco points
userSchema.methods.addEcoPoints = function(points) {
  this.ecoPoints += points;
  return this.save();
};

// Method to update streak
userSchema.methods.updateStreak = function(newStreak) {
  this.currentStreak = newStreak;
  if (newStreak > this.longestStreak) {
    this.longestStreak = newStreak;
  }
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badge) {
  this.badges.push(badge);
  return this.save();
};

// Method to add certification
userSchema.methods.addCertification = function(certification) {
  this.certifications.push(certification);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
