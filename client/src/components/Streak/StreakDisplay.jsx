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

  // Full version - Horizontal compact layout
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border border-orange-200">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Main Streak Display */}
          <div className="flex items-center space-x-4">
            <div className={`text-5xl ${getFlameColor(streakData.currentStreak)}`}>
              🔥
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {streakData.currentStreak}
              </div>
              <div className="text-sm text-gray-600">
                {streakData.currentStreak === 0 ? 'No streak yet' : `Day${streakData.currentStreak !== 1 ? 's' : ''} in a row`}
              </div>
              <div className="text-xs text-gray-500">
                {getStreakMessage(streakData.currentStreak)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex space-x-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm min-w-[100px]">
              <div className="text-xl font-bold text-purple-600">
                {streakData.longestStreak}
              </div>
              <div className="text-xs text-gray-600">Longest</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm min-w-[100px]">
              <div className="text-xl font-bold text-blue-600">
                {streakData.totalEntries}
              </div>
              <div className="text-xs text-gray-600">Total Entries</div>
            </div>
          </div>

          {/* Milestone Progress */}
          {streakData.nextMilestone && (
            <div className="bg-white rounded-lg p-3 shadow-sm min-w-[200px]">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-600">Next milestone:</span>
                <span className="font-semibold text-orange-600">
                  {streakData.nextMilestone} days
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((streakData.currentStreak / streakData.nextMilestone) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 text-sm bg-white text-orange-600 hover:bg-orange-100 rounded-lg border border-orange-300 transition duration-200 font-medium"
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>

        {/* Warning if not written today */}
        {!streakData.writtenToday && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
            <div className="text-yellow-700 text-sm">
              ✏️ Write an entry today to continue your streak!
            </div>
          </div>
        )}
      </div>

      {showCalendar && (
        <div className="mt-4 pt-4 border-t border-orange-200">
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

  // Get the current month and organize days into weeks
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get first day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Get last day of current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  
  // Create calendar grid
  const weeks = [];
  let currentWeek = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    currentWeek.push({ day, dateString });
    
    // If week is complete (Sunday to Saturday), start new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add remaining days to last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  // Week number calculation
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 text-center">
        {monthNames[currentMonth]} {currentYear}
      </h3>
      
      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Header Row - Day Names */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-[9px] font-semibold text-gray-400 text-center">Wk</div>
          {dayNames.map(day => (
            <div key={day} className="text-[9px] font-semibold text-gray-600 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Weeks */}
        {weeks.map((week, weekIndex) => {
          const firstDayInWeek = week.find(d => d !== null);
          const weekNumber = firstDayInWeek ? getWeekNumber(new Date(firstDayInWeek.dateString)) : '';
          
          return (
            <div key={weekIndex} className="grid grid-cols-8 gap-1">
              {/* Week Number */}
              <div className="text-[9px] text-gray-400 flex items-center justify-center font-medium">
                {weekNumber}
              </div>
              
              {/* Days */}
              {week.map((dayObj, dayIndex) => {
                if (!dayObj) {
                  return <div key={`empty-${dayIndex}`} className="w-6 h-6"></div>;
                }
                
                const hasEntry = calendarData.activity[dayObj.dateString];
                const isToday = dayObj.dateString === streakService.getTodayDateString();
                
                return (
                  <div
                    key={dayObj.dateString}
                    className={`w-6 h-6 rounded text-[10px] flex items-center justify-center transition-all duration-200 ${
                      isToday 
                        ? 'bg-brand-primary text-white font-bold ring-2 ring-brand-primary ring-offset-1' 
                        : hasEntry
                        ? 'bg-brand-primary/80 text-white font-semibold hover:bg-brand-primary'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={`${dayObj.dateString}${hasEntry ? ' - Entry written' : ''}`}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-brand-primary rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-brand-primary/80 rounded"></div>
          <span>Entry written</span>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;