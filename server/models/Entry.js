import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true,
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Add field to track if this entry should count for streak
  countsForStreak: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better query performance
entrySchema.index({ user: 1, createdAt: -1 });
entrySchema.index({ user: 1, countsForStreak: 1 });

// Update user's writing streak when a new entry is created
entrySchema.post('save', async function() {
  if (this.countsForStreak) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user);
      
      if (user) {
        const entryDate = this.createdAt.toISOString().split('T')[0];
        user.updateWritingStreak(entryDate);
        await user.save();
      }
    } catch (error) {
      console.error('Error updating writing streak:', error);
    }
  }
});

// Update user's writing streak when an entry is deleted
entrySchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.countsForStreak) {
    try {
      // Recalculate streak for user since an entry was removed
      const User = mongoose.model('User');
      await User.recalculateStreak(doc.user);
    } catch (error) {
      console.error('Error recalculating streak after deletion:', error);
    }
  }
});

// Static method to get total entries count for a user
entrySchema.statics.getTotalEntries = async function(userId) {
  const count = await this.countDocuments({ user: userId });
  return count;
};

// Instance method to return entry in specific format
entrySchema.methods.toClientFormat = function() {
  const obj = this.toObject();
  
  return {
    id: obj._id,
    title: obj.title,
    content: obj.content,
    isPublic: obj.isPublic,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    user: obj.user
  };
};

export default mongoose.model('Entry', entrySchema);