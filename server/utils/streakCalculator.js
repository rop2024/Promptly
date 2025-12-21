// Utility functions for streak calculations

/**
 * Get today's date in YYYY-MM-DD format
 * @param {string} timezone - Optional timezone
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getTodayDateString = (timezone = 'UTC') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate streak from array of date strings
 * @param {string[]} dateStrings - Array of dates in YYYY-MM-DD format
 * @returns {Object} Streak information
 */
export const calculateStreakFromDates = (dateStrings) => {
  if (!dateStrings || dateStrings.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null
    };
  }

  // Sort and remove duplicates
  const uniqueDates = [...new Set(dateStrings)].sort();
  const today = getTodayDateString();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastActivity = uniqueDates[uniqueDates.length - 1];

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffTime = currDate - prevDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    // diffDays === 0 shouldn't happen with unique dates
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak (consecutive days up to today)
  const sortedDates = uniqueDates.sort((a, b) => b.localeCompare(a)); // Most recent first
  currentStreak = 0;
  
  let expectedDate = new Date(today);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const diffTime = expectedDate - currentDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today's entry
      currentStreak = 1;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (diffDays === 1 && (i === 0 || currentStreak > 0)) {
      // Consecutive day
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActivity,
    totalActiveDays: uniqueDates.length
  };
};

/**
 * Check if a date string is yesterday relative to today
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isYesterday = (dateString) => {
  const today = new Date(getTodayDateString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const checkDate = new Date(dateString);
  
  return checkDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
};

/**
 * Check if a date string is today
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  return dateString === getTodayDateString();
};

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateString 
 * @returns {boolean}
 */
export const isValidDateString = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};