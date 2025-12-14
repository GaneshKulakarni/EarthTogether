const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Waste Reduction', 'Energy', 'Transportation', 'Water', 'Food', 'General']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom']
  },
  customFrequency: {
    days: Number,
    description: String
  },
  ecoPoints: {
    type: Number,
    default: 10,
    min: 1
  },
  carbonSaved: {
    type: Number,
    default: 0.5,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  targetDays: {
    type: Number,
    default: 1
  },
  completions: [{
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    photoUrl: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  completedDates: [{
    type: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  reminderTime: {
    type: String,
    default: '09:00'
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure name or title exists
habitSchema.pre('save', function(next) {
  if (!this.name && !this.title) {
    return next(new Error('Either name or title is required'));
  }
  if (!this.name) this.name = this.title;
  if (!this.title) this.title = this.name;
  next();
});

// Virtual for completion rate
habitSchema.virtual('completionRate').get(function() {
  if (this.completions.length === 0) return 0;
  const totalDays = Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  return Math.round((this.completions.length / totalDays) * 100);
});

// Virtual for days since last completion
habitSchema.virtual('daysSinceLastCompletion').get(function() {
  if (this.completions.length === 0) return null;
  const lastCompletion = this.completions[this.completions.length - 1];
  return Math.ceil((Date.now() - lastCompletion.date) / (1000 * 60 * 60 * 24));
});

// Method to mark habit as completed
habitSchema.methods.markCompleted = async function(notes = '', photoUrl = '') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if already completed today
  const completedToday = this.completedDates.some(date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  
  if (completedToday) {
    throw new Error('Habit already completed today');
  }
  
  const completion = {
    date: new Date(),
    notes,
    photoUrl,
    verified: false
  };

  this.completions.push(completion);
  this.completedDates.push(new Date());
  
  // Update streak
  if (this.completedDates.length > 1) {
    const lastDate = new Date(this.completedDates[this.completedDates.length - 2]);
    lastDate.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.getTime() === yesterday.getTime()) {
      this.currentStreak += 1;
    } else {
      this.currentStreak = 1;
    }
  } else {
    this.currentStreak = 1;
  }

  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  return await this.save();
};

// Method to calculate carbon savings
habitSchema.methods.calculateCarbonSavings = function() {
  return this.completions.length * this.carbonSaved;
};

// Index for efficient queries
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
