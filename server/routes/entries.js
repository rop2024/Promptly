import express from 'express';
import { body, validationResult, param } from 'express-validator';
import Entry from '../models/Entry.js';
import { protect } from '../middleware/auth.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const validateEntry = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 10000 })
    .withMessage('Content cannot be more than 10000 characters'),
  body('mood')
    .optional()
    .isIn(['happy', 'sad', 'excited', 'angry', 'peaceful', 'anxious', 'grateful', 'tired', 'motivated', 'neutral'])
    .withMessage('Invalid mood value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// @desc    Get all entries for logged in user
// @route   GET /api/entries
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filtering
    const filter = { user: req.user.id };
    
    // Mood filter
    if (req.query.mood) {
      filter.mood = req.query.mood;
    }
    
    // Tag filter
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search in title and content
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const entries = await Entry.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Entry.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: entries.length,
      pagination: {
        page,
        totalPages,
        totalEntries: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: entries.map(entry => entry.toClientFormat())
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single entry
// @route   GET /api/entries/:id
// @access  Private
router.get('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const entry = await Entry.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!entry) {
      return next(new ErrorResponse('Entry not found', 404));
    }

    res.status(200).json({
      success: true,
      data: entry.toClientFormat()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new entry
// @route   POST /api/entries
// @access  Private
router.post('/', validateEntry, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const entry = await Entry.create(req.body);

    res.status(201).json({
      success: true,
      data: entry.toClientFormat()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update entry
// @route   PUT /api/entries/:id
// @access  Private
router.put('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID'),
  ...validateEntry
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let entry = await Entry.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!entry) {
      return next(new ErrorResponse('Entry not found', 404));
    }

    // Update entry
    entry = await Entry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    res.status(200).json({
      success: true,
      data: entry.toClientFormat()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete entry
// @route   DELETE /api/entries/:id
// @access  Private
router.delete('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const entry = await Entry.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!entry) {
      return next(new ErrorResponse('Entry not found', 404));
    }

    await Entry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get entry statistics
// @route   GET /api/entries/stats/overview
// @access  Private
router.get('/stats/overview', async (req, res, next) => {
  try {
    const totalEntries = await Entry.countDocuments({ user: req.user.id });
    
    // Mood statistics
    const moodStats = await Entry.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Entries per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Entry.aggregate([
      { 
        $match: { 
          user: req.user._id,
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent activity
    const recentEntries = await Entry.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt mood');

    res.status(200).json({
      success: true,
      data: {
        totalEntries,
        moodStats,
        monthlyStats,
        recentActivity: recentEntries
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all unique tags for user
// @route   GET /api/entries/tags/all
// @access  Private
router.get('/tags/all', async (req, res, next) => {
  try {
    const tags = await Entry.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
});

export default router;