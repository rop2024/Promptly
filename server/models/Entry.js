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
  mood: {
    type: String,
    enum: [
      'happy', 'sad', 'excited', 'angry', 'peaceful', 
      'anxious', 'grateful', 'tired', 'motivated', 'neutral'
    ],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better query performance
entrySchema.index({ user: 1, createdAt: -1 });
entrySchema.index({ tags: 1 });

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
    mood: obj.mood,
    tags: obj.tags,
    isPublic: obj.isPublic,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    user: obj.user
  };
};

export default mongoose.model('Entry', entrySchema);