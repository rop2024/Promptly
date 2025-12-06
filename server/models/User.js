import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password in queries by default
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Prompt-related fields
  lastPromptDate: {
    type: String, // YYYY-MM-DD format
    default: null
  },
  promptStreak: {
    type: Number,
    default: 0
  },
  totalPromptsCompleted: {
    type: Number,
    default: 0
  },
  // Writing streak fields
  writingStreak: {
    type: Number,
    default: 0
  },
  lastWritingDate: {
    type: String, // YYYY-MM-DD format
    default: null
  },
  longestWritingStreak: {
    type: Number,
    default: 0
  },
  totalEntriesWritten: {
    type: Number,
    default: 0
  },
  // Level system
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  // User preferences
  preferences: {
    promptCategories: {
      type: [String],
      default: ['reflection', 'creativity', 'gratitude', 'goals', 'mindfulness']
    },
    promptTime: {
      type: String,
      default: 'morning'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    stuckPromptEnabled: {
      type: Boolean,
      default: true
    }
  },
  streakHistory: [{
    date: String, // YYYY-MM-DD
    streak: Number,
    entryCount: Number
  }]
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and return JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Method to update writing streak
userSchema.methods.updateWritingStreak = function(entryDate = null) {
  const today = this.getCurrentDateString();
  const entryDateStr = entryDate || today;
  
  // Don't allow future dates
  if (entryDateStr > today) {
    return this.writingStreak;
  }

  // If no last writing date, start streak at 1
  if (!this.lastWritingDate) {
    this.writingStreak = 1;
    this.lastWritingDate = entryDateStr;
    this.totalEntriesWritten += 1;
    this.updateLongestStreak();
    return this.writingStreak;
  }

  const lastDate = new Date(this.lastWritingDate);
  const currentDate = new Date(entryDateStr);
  const diffTime = currentDate - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day - don't change streak, but update last writing date if newer
    if (entryDateStr > this.lastWritingDate) {
      this.lastWritingDate = entryDateStr;
    }
    this.totalEntriesWritten += 1;
  } else if (diffDays === 1) {
    // Consecutive day - increment streak
    this.writingStreak += 1;
    this.lastWritingDate = entryDateStr;
    this.totalEntriesWritten += 1;
    this.updateLongestStreak();
  } else if (diffDays > 1) {
    // Broken streak - reset to 1
    this.writingStreak = 1;
    this.lastWritingDate = entryDateStr;
    this.totalEntriesWritten += 1;
    this.updateLongestStreak();
  }
  // If diffDays < 0, it's a past date that we've already recorded

  return this.writingStreak;
};

// Method to update longest streak record
userSchema.methods.updateLongestStreak = function() {
  if (this.writingStreak > this.longestWritingStreak) {
    this.longestWritingStreak = this.writingStreak;
  }
};

// Method to get current date in YYYY-MM-DD format
userSchema.methods.getCurrentDateString = function() {
  return new Date().toISOString().split('T')[0];
};

// Static method to calculate level and XP based on words and time
userSchema.statics.calculateLevel = function(totalWords, totalTimeSpent) {
  // XP calculation: 1 XP per word + 1 XP per 10 seconds of writing
  const wordXP = totalWords;
  const timeXP = Math.floor(totalTimeSpent / 10);
  const totalXP = wordXP + timeXP;
  
  // Level calculation: exponential curve
  // Level 1: 0 XP
  // Level 2: 100 XP
  // Level 3: 250 XP
  // Level 4: 500 XP
  // Formula: XP needed = 100 * level * (level - 1) / 2
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;
  
  while (totalXP >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = 100 * level * (level + 1) / 2;
  }
  
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
  
  return {
    level,
    experiencePoints: totalXP,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage,
    xpForNextLevel
  };
};

// Static method to recalculate streak for a user (for data integrity)
userSchema.statics.recalculateStreak = async function(userId) {
  const Entry = mongoose.model('Entry');
  
  // Get all unique dates the user has written entries (sorted)
  const writingDates = await Entry.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
      }
    },
    { $group: { _id: "$date" } },
    { $sort: { _id: 1 } }
  ]);

  const dateStrings = writingDates.map(d => d._id);
  
  if (dateStrings.length === 0) {
    return 0;
  }

  // Calculate streak by checking consecutive dates
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < dateStrings.length; i++) {
    const prevDate = new Date(dateStrings[i - 1]);
    const currDate = new Date(dateStrings[i]);
    const diffTime = currDate - prevDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // If diffDays === 0, same day - don't change streak
  }

  // Update user with calculated streak
  await this.findByIdAndUpdate(userId, {
    writingStreak: currentStreak,
    longestWritingStreak: maxStreak,
    lastWritingDate: dateStrings[dateStrings.length - 1],
    totalEntriesWritten: writingDates.length
  });

  return currentStreak;
};

export default mongoose.model('User', userSchema);
