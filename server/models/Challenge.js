const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Waste Reduction', 'Energy', 'Transportation', 'Water', 'Food', 'General']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  ecoPoints: {
    type: Number,
    required: true,
    min: 10
  },
  carbonSaved: {
    type: Number,
    required: true,
    min: 0
  },
  requirements: [{
    type: String,
    required: true
  }],
  rewards: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastUpdated: Date,
    submissions: [{
      content: String,
      imageUrl: String,
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  maxParticipants: {
    type: Number,
    default: 1000
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  imageUrl: String
}, {
  timestamps: true
});

// Virtual for completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.participants.length === 0) return 0;
  const completed = this.participants.filter(p => p.completed).length;
  return Math.round((completed / this.participants.length) * 100);
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const remaining = Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
  return remaining > 0 ? remaining : 0;
});

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to add participant
challengeSchema.methods.addParticipant = function(userId) {
  if (this.participants.some(p => p.user.toString() === userId)) {
    throw new Error('User is already participating in this challenge');
  }
  
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is full');
  }
  
  this.participants.push({
    user: userId,
    progress: 0
  });
  
  return this.save();
};

// Method to remove participant
challengeSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId);
  return this.save();
};

// Method to update participant progress
challengeSchema.methods.updateProgress = function(userId, progress, submission = null) {
  const participant = this.participants.find(p => p.user.toString() === userId);
  
  if (!participant) {
    throw new Error('User is not participating in this challenge');
  }
  
  participant.progress = Math.min(100, Math.max(0, progress));
  participant.lastUpdated = new Date();
  
  if (submission) {
    participant.submissions.push(submission);
  }
  
  // Check if challenge is completed
  if (participant.progress >= 100 && !participant.completed) {
    participant.completed = true;
    participant.completedAt = new Date();
  }
  
  return this.save();
};

// Method to get leaderboard
challengeSchema.methods.getLeaderboard = function() {
  return this.participants
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10);
};

// Index for efficient queries
challengeSchema.index({ status: 1, startDate: -1 });
challengeSchema.index({ category: 1, status: 1 });
challengeSchema.index({ createdBy: 1 });
challengeSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
