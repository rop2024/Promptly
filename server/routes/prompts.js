import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { getRandomPrompt, getTodayDateString, hasCompletedPromptToday } from '../data/dailyPrompts.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get today's daily prompt
// @route   GET /api/prompts/today
// @access  Private
router.get('/today', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if user has already completed prompt today
    if (hasCompletedPromptToday(user)) {
      return res.status(200).json({
        success: true,
        data: {
          prompt: null,
          message: 'You have already completed your daily prompt today!',
          completed: true,
          streak: user.promptStreak,
          lastCompleted: user.lastPromptDate
        }
      });
    }

    // Get random prompt based on user preferences
    const promptData = getRandomPrompt(user.preferences?.promptCategories);
    
    res.status(200).json({
      success: true,
      data: {
        prompt: promptData.prompt,
        category: promptData.category,
        promptId: promptData.id,
        completed: false,
        streak: user.promptStreak,
        message: 'Here is your daily prompt!'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark prompt as completed
// @route   POST /api/prompts/complete
// @access  Private
router.post('/complete', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const today = getTodayDateString();
    
    // Check if already completed today
    if (hasCompletedPromptToday(user)) {
      return next(new ErrorResponse('Prompt already completed today', 400));
    }

    // Calculate streak
    let newStreak = user.promptStreak;
    if (user.lastPromptDate) {
      const lastDate = new Date(user.lastPromptDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increase streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Broken streak - reset to 1
        newStreak = 1;
      } else {
        // Same day or future date (shouldn't happen)
        newStreak = user.promptStreak;
      }
    } else {
      // First time completing a prompt
      newStreak = 1;
    }

    // Update user
    user.lastPromptDate = today;
    user.promptStreak = newStreak;
    user.totalPromptsCompleted += 1;
    
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Daily prompt completed!',
        streak: user.promptStreak,
        totalCompleted: user.totalPromptsCompleted,
        completedDate: today
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get prompt statistics
// @route   GET /api/prompts/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('lastPromptDate promptStreak totalPromptsCompleted preferences');
    
    const today = getTodayDateString();
    const completedToday = hasCompletedPromptToday(user);
    
    res.status(200).json({
      success: true,
      data: {
        streak: user.promptStreak,
        totalCompleted: user.totalPromptsCompleted,
        completedToday: completedToday,
        lastCompletion: user.lastPromptDate,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update prompt preferences
// @route   PUT /api/prompts/preferences
// @access  Private
router.put('/preferences', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (req.body.promptCategories) {
      user.preferences.promptCategories = req.body.promptCategories;
    }
    
    if (req.body.promptTime) {
      user.preferences.promptTime = req.body.promptTime;
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Preferences updated successfully',
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Skip today's prompt (without breaking streak)
// @route   POST /api/prompts/skip
// @access  Private
router.post('/skip', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const today = getTodayDateString();
    
    // Only skip if not already completed
    if (!hasCompletedPromptToday(user)) {
      user.lastPromptDate = today;
      // Don't increment streak or total count for skips
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Prompt skipped for today',
        streak: user.promptStreak,
        completedToday: true
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;