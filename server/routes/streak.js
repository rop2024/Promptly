import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Entry from '../models/Entry.js';
import { calculateStreakFromDates, getTodayDateString } from '../utils/streakCalculator.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get user's writing streak information
// @route   GET /api/streak
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('writingStreak lastWritingDate longestWritingStreak totalEntriesWritten preferences');
    
    // Get recent writing dates for detailed streak calculation
    const writingDates = await Entry.aggregate([
      { 
        $match: { 
          user: req.user._id,
          countsForStreak: true 
        } 
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }
      },
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } }, // Most recent first
      { $limit: 30 } // Last 30 days for current streak calculation
    ]);

    const dateStrings = writingDates.map(d => d._id);
    const detailedStreak = calculateStreakFromDates(dateStrings);

    // If there's a discrepancy, recalculate for data integrity
    if (detailedStreak.currentStreak !== user.writingStreak) {
      await User.recalculateStreak(req.user.id);
      // Refetch user data
      const updatedUser = await User.findById(req.user.id).select('writingStreak lastWritingDate longestWritingStreak totalEntriesWritten');
      user.writingStreak = updatedUser.writingStreak;
      user.lastWritingDate = updatedUser.lastWritingDate;
      user.longestWritingStreak = updatedUser.longestWritingStreak;
      user.totalEntriesWritten = updatedUser.totalEntriesWritten;
    }

    const today = getTodayDateString();
    const writtenToday = dateStrings.includes(today);

    res.status(200).json({
      success: true,
      data: {
        currentStreak: user.writingStreak,
        longestStreak: user.longestWritingStreak,
        lastWritingDate: user.lastWritingDate,
        totalEntries: user.totalEntriesWritten,
        writtenToday: writtenToday,
        today: today,
        streakHistory: detailedStreak,
        // Additional motivation data
        nextMilestone: getNextMilestone(user.writingStreak),
        streakStatus: getStreakStatus(user.writingStreak)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get streak calendar (recent writing activity)
// @route   GET /api/streak/calendar
// @access  Private
router.get('/calendar', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const calendarData = await Entry.aggregate([
      { 
        $match: { 
          user: req.user._id,
          countsForStreak: true,
          createdAt: { 
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) 
          }
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          entryCount: { $sum: 1 },
          lastEntry: { $max: "$createdAt" }
        }
      },
      { $sort: { "_id.date": -1 } }
    ]);

    // Format for calendar display
    const activityMap = {};
    calendarData.forEach(day => {
      activityMap[day._id.date] = {
        entryCount: day.entryCount,
        lastEntry: day.lastEntry
      };
    });

    res.status(200).json({
      success: true,
      data: {
        days: days,
        activity: activityMap,
        totalDays: calendarData.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Force streak recalculation (for data integrity)
// @route   POST /api/streak/recalculate
// @access  Private
router.post('/recalculate', async (req, res, next) => {
  try {
    const newStreak = await User.recalculateStreak(req.user.id);
    
    const user = await User.findById(req.user.id).select('writingStreak lastWritingDate longestWritingStreak totalEntriesWritten');

    res.status(200).json({
      success: true,
      data: {
        message: 'Streak recalculated successfully',
        currentStreak: user.writingStreak,
        longestStreak: user.longestWritingStreak,
        totalEntries: user.totalEntriesWritten
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get streak leaderboard (optional - for community features)
// @route   GET /api/streak/leaderboard
// @access  Private
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await User.aggregate([
      { $match: { writingStreak: { $gt: 0 } } },
      { $sort: { writingStreak: -1, longestWritingStreak: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          writingStreak: 1,
          longestWritingStreak: 1,
          totalEntriesWritten: 1,
          lastWritingDate: 1
        }
      }
    ]);

    // Anonymize for privacy (show only first initial and last name)
    const anonymizedLeaderboard = leaderboard.map(user => ({
      ...user,
      name: user.name ? `${user.name.charAt(0)}.` : 'Anonymous'
    }));

    // Get user's position
    const userRank = await User.countDocuments({
      writingStreak: { $gt: req.user.writingStreak }
    }) + 1;

    res.status(200).json({
      success: true,
      data: {
        leaderboard: anonymizedLeaderboard,
        userRank: userRank,
        totalUsers: await User.countDocuments({ writingStreak: { $gt: 0 } })
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
const getNextMilestone = (currentStreak) => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  const next = milestones.find(milestone => milestone > currentStreak);
  return next || null;
};

const getStreakStatus = (streak) => {
  if (streak === 0) return 'new';
  if (streak < 3) return 'beginner';
  if (streak < 7) return 'consistent';
  if (streak < 30) return 'dedicated';
  if (streak < 90) return 'expert';
  return 'legendary';
};

export default router;