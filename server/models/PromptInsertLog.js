import mongoose from 'mongoose';

const PromptInsertLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  promptText: {
    type: String,
    required: true
  },
  promptId: {
    type: String
  },
  insertedAt: {
    type: Date,
    default: Date.now
  },
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    default: null
  },
  mode: {
    type: String,
    enum: ['ghost', 'assist', 'auto'],
    required: true
  }
});

// Index on user and insertedAt for analytics queries
PromptInsertLogSchema.index({ user: 1, insertedAt: -1 });

export default mongoose.model('PromptInsertLog', PromptInsertLogSchema);
