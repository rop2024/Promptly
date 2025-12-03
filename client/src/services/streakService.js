import api from './api.js';

// Streak service
const streakService = {
  // Get streak information
  getStreak: async () => {
    const response = await api.get('/streak');
    return response.data;
  },

  // Get calendar data
  getCalendar: async (days = 30) => {
    const response = await api.get(`/streak/calendar?days=${days}`);
    return response.data;
  },

  // Recalculate streak
  recalculateStreak: async () => {
    const response = await api.post('/streak/recalculate');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/streak/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Client-side streak calculation (for offline/fallback)
  calculateClientStreak: (entries) => {
    if (!entries || entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, writtenToday: false };
    }

    // Get unique dates from entries
    const dateSet = new Set();
    entries.forEach(entry => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      dateSet.add(dateStr);
    });

    const dates = Array.from(dateSet).sort();
    const today = new Date().toISOString().split('T')[0];

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check current streak (consecutive days up to today)
    let checkDate = new Date(today);
    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[dates.length - 1 - i]); // Start from most recent
      const expectedDate = new Date(checkDate);
      
      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffTime = currDate - prevDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      writtenToday: dates.includes(today),
      totalActiveDays: dates.length
    };
  },

  // Utility to get today's date string
  getTodayDateString: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Check if user has written today
  hasWrittenToday: (entries) => {
    const today = new Date().toISOString().split('T')[0];
    return entries.some(entry => 
      new Date(entry.createdAt).toISOString().split('T')[0] === today
    );
  }
};

export default streakService;