import express from 'express';
import PromptInsertLog from '../models/PromptInsertLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/analytics/prompt-insert
// @desc    Log a prompt insertion event
// @access  Protected
router.post('/prompt-insert', protect, async (req, res) => {
  try {
    const { promptText, promptId, mode, entryId } = req.body;

    // Validate required fields
    if (!promptText || !mode) {
      return res.status(400).json({
        success: false,
        message: 'promptText and mode are required'
      });
    }

    // Validate mode enum
    if (!['ghost', 'assist', 'auto'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'mode must be one of: ghost, assist, auto'
      });
    }

    // Privacy enforcement: Only store original promptText as inserted
    // Explicitly ignore any editedText, finalContent, or similar fields
    // Log must not contain subsequent user edits
    const logEntry = await PromptInsertLog.create({
      user: req.user.id,
      promptText, // Only the original prompt text, never user-edited content
      promptId: promptId || null,
      mode,
      entryId: entryId || null
    });

    res.status(201).json({
      success: true,
      data: logEntry
    });
  } catch (error) {
    console.error('Error logging prompt insert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging prompt insertion'
    });
  }
});

export default router;
