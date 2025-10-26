import React, { useState, useEffect } from 'react';
import streakService from '../../services/streakService.js';

const StreakDisplay = ({ compact = false, onStreakUpdate }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const result = await streakService.getStreak();
      setStreakData(result.data);
      if (onStreakUpdate) {
        onStreakUpdate(result.data);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlameColor = (streak) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 3) return 'text-orange-400';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-red-500';
    if (streak < 90) return 'text-purple-500';
    return 'text-yellow-300';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Start your writing streak today!";
    if (streak === 1) return "Great start! Keep going tomorrow.";
    if (streak < 3) return "You're building a habit!";
    if (streak < 7) return "You're on a roll!";
    if (streak < 30) return "Amazing consistency!";
    if (streak < 90) return "Incredible dedication!";
    return "Legendary writer!";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  // Compact version for dashboard
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${getFlameColor(streakData.currentStreak)}`}>
              🔥
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500">
                Writing streak
              </div>
            </div>
          </div>
          {streakData.writtenToday && (
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Today ✓
            </div>
          )}
        </div>
        
        {!streakData.writtenToday && (
          <div className="mt-2 text-xs text-orange-600">
            Write today to keep your streak!
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Writing Streak</h2>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </button>
      </div>

      <div className="text-center mb-6">
        <div className={`text-6xl mb-2 ${getFlameColor(streakData.currentStreak)}`}>
          🔥
        </div>
        <div className="text-4xl font-bold text-gray-800 mb-2">
          {streakData.currentStreak}
        </div>
        <div className="text-lg text-gray-600 mb-1">
          {streakData.currentStreak === 0 ? 'No streak yet' : `Day${streakData.currentStreak !== 1 ? 's' : ''} in a row`}
        </div>
        <div className="text-sm text-gray-500">
          {getStreakMessage(streakData.currentStreak)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {streakData.longestStreak}
          </div>
          <div className="text-xs text-gray-600">Longest Streak</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {streakData.totalEntries}
          </div>
          <div className="text-xs text-gray-600">Total Entries</div>
        </div>
      </div>

      {streakData.nextMilestone && (
        <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Next milestone:</span>
            <span className="font-semibold text-orange-600">
              {streakData.nextMilestone} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((streakData.currentStreak / streakData.nextMilestone) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {!streakData.writtenToday && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="text-yellow-700 text-sm">
            ✏️ Write an entry today to continue your streak!
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="mt-4">
          <StreakCalendar />
        </div>
      )}
    </div>
  );
};

// Additional component for calendar view
const StreakCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const result = await streakService.getCalendar(30);
      setCalendarData(result.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading calendar...</div>;
  }

  // Generate last 30 days for calendar
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">30-Day Activity</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const hasEntry = calendarData.activity[day];
          const isToday = day === streakService.getTodayDateString();
          
          return (
            <div
              key={day}
              className={`aspect-square rounded text-xs flex items-center justify-center ${
                hasEntry 
                  ? 'bg-green-500 text-white' 
                  : isToday 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-gray-100 text-gray-400'
              } ${isToday ? 'border-2 border-blue-400' : ''}`}
              title={`${day}${hasEntry ? ' - Entry written' : ''}`}
            >
              {new Date(day).getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <div className="w-3 h-3 bg-green-500 rounded"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakDisplay;