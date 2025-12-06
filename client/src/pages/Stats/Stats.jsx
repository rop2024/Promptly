import React, { useState, useEffect } from 'react';
import entryService from '../../services/entryService.js';
import streakService from '../../services/streakService.js';

const Stats = ({ currentUser }) => {
  const [stats, setStats] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week

  useEffect(() => {
    loadStatsData();
  }, [currentUser]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResult = await entryService.getStats();
      setStats(statsResult.data?.data || null);

      // Load streak data
      const streakResult = await streakService.getStreak();
      setStreakData(streakResult.data?.data || null);

    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return 0;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Statistics</h1>
          <p className="text-gray-600 mt-1">Track your writing progress and achievements</p>
        </div>
        
        {/* Timeframe selector */}
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              timeframe === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              timeframe === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
              timeframe === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-gray-800">{formatNumber(stats?.totalEntries)}</div>
            <div className="text-gray-600 text-sm mt-1">Total Entries</div>
            <div className="text-xs text-gray-500 mt-2">All your written entries</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-gray-800">{streakData?.currentStreak || 0}</div>
            <div className="text-gray-600 text-sm mt-1">Current Streak 🔥</div>
            <div className="text-xs text-gray-500 mt-2">Days in a row writing</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-gray-800">{stats?.uniquePrompts || 0}</div>
            <div className="text-gray-600 text-sm mt-1">Unique Prompts</div>
            <div className="text-xs text-gray-500 mt-2">Different prompts used</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-gray-800">{formatNumber(stats?.totalWords)}</div>
            <div className="text-gray-600 text-sm mt-1">Total Words Written</div>
            <div className="text-xs text-gray-500 mt-2">Across all entries</div>
          </div>
        </div>
      </div>

      {/* Writing Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Writing Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500">
            <div className="text-3xl font-bold text-gray-800">{stats?.averageWords || 0}</div>
            <div className="text-gray-600 text-sm mt-1">Avg Words Per Entry</div>
            <div className="text-xs text-gray-500 mt-2">Your typical entry length</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="text-3xl font-bold text-gray-800">{streakData?.longestStreak || 0}</div>
            <div className="text-gray-600 text-sm mt-1">Longest Streak</div>
            <div className="text-xs text-gray-500 mt-2">Your best consistency</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
            <div className="text-3xl font-bold text-gray-800">
              {stats?.totalEntries > 0 ? Math.round((stats?.uniquePrompts / stats?.totalEntries) * 100) : 0}%
            </div>
            <div className="text-gray-600 text-sm mt-1">Prompt Variety</div>
            <div className="text-xs text-gray-500 mt-2">Diversity in your writing</div>
          </div>
        </div>
      </div>

      {/* Streak Information */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Streak Details</h2>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-sm p-8 border border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {streakData?.currentStreak || 0}
              </div>
              <div className="text-gray-700 font-medium">Current Streak</div>
              <div className="text-sm text-gray-600 mt-1">
                {streakData?.writtenToday ? '✅ Written today!' : '⏰ Write today to continue'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">
                {streakData?.longestStreak || 0}
              </div>
              <div className="text-gray-700 font-medium">Longest Streak</div>
              <div className="text-sm text-gray-600 mt-1">Your personal best</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">
                {stats?.totalEntries || 0}
              </div>
              <div className="text-gray-700 font-medium">Total Days Written</div>
              <div className="text-sm text-gray-600 mt-1">Lifetime count</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Entry */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${stats?.totalEntries >= 1 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">✍️</div>
            <div className="font-bold text-gray-800">First Steps</div>
            <div className="text-sm text-gray-600">Write your first entry</div>
            {stats?.totalEntries >= 1 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>

          {/* 7-day Streak */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${streakData?.longestStreak >= 7 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">🔥</div>
            <div className="font-bold text-gray-800">Week Warrior</div>
            <div className="text-sm text-gray-600">Maintain a 7-day streak</div>
            {streakData?.longestStreak >= 7 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>

          {/* 30-day Streak */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${streakData?.longestStreak >= 30 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-bold text-gray-800">Monthly Master</div>
            <div className="text-sm text-gray-600">Maintain a 30-day streak</div>
            {streakData?.longestStreak >= 30 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>

          {/* 50 Entries */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${stats?.totalEntries >= 50 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">📚</div>
            <div className="font-bold text-gray-800">Prolific Writer</div>
            <div className="text-sm text-gray-600">Write 50 entries</div>
            {stats?.totalEntries >= 50 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>

          {/* 10,000 Words */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${stats?.totalWords >= 10000 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">📝</div>
            <div className="font-bold text-gray-800">Wordsmith</div>
            <div className="text-sm text-gray-600">Write 10,000 words</div>
            {stats?.totalWords >= 10000 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>

          {/* 100-day Streak */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${streakData?.longestStreak >= 100 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
            <div className="text-4xl mb-2">💎</div>
            <div className="font-bold text-gray-800">Century Club</div>
            <div className="text-sm text-gray-600">Maintain a 100-day streak</div>
            {streakData?.longestStreak >= 100 && (
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Completed</div>
            )}
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Keep Going! 💪</h2>
        <div className="space-y-3">
          {streakData?.currentStreak > 0 && (
            <p className="text-blue-100">
              You're on a {streakData.currentStreak}-day streak! Don't break the chain.
            </p>
          )}
          {stats?.totalWords >= 1000 && (
            <p className="text-blue-100">
              You've written {formatNumber(stats.totalWords)} words. That's amazing progress!
            </p>
          )}
          {stats?.totalEntries >= 10 && (
            <p className="text-blue-100">
              With {stats.totalEntries} entries, you're building a rich collection of thoughts and memories.
            </p>
          )}
          <p className="text-blue-100 italic">
            "Writing is the painting of the voice." - Keep creating!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
