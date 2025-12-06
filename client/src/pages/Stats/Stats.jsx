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

      // Load streak data (streakService already returns response.data)
      const streakResult = await streakService.getStreak();
      setStreakData(streakResult?.data || null);

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

  // Achievement definitions
  const achievements = [
    {
      id: 'first-steps',
      emoji: '✍️',
      title: 'First Steps',
      description: 'Write your first entry',
      condition: () => (stats?.totalEntries || 0) >= 1,
      progress: () => Math.min((stats?.totalEntries || 0) / 1 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/1 entries`
    },
    {
      id: 'early-bird',
      emoji: '🌅',
      title: 'Early Bird',
      description: 'Write 5 entries',
      condition: () => (stats?.totalEntries || 0) >= 5,
      progress: () => Math.min((stats?.totalEntries || 0) / 5 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/5 entries`
    },
    {
      id: 'dedicated',
      emoji: '📖',
      title: 'Dedicated Writer',
      description: 'Write 10 entries',
      condition: () => (stats?.totalEntries || 0) >= 10,
      progress: () => Math.min((stats?.totalEntries || 0) / 10 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/10 entries`
    },
    {
      id: 'regular',
      emoji: '🎯',
      title: 'Regular Contributor',
      description: 'Write 25 entries',
      condition: () => (stats?.totalEntries || 0) >= 25,
      progress: () => Math.min((stats?.totalEntries || 0) / 25 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/25 entries`
    },
    {
      id: 'prolific',
      emoji: '📚',
      title: 'Prolific Writer',
      description: 'Write 50 entries',
      condition: () => (stats?.totalEntries || 0) >= 50,
      progress: () => Math.min((stats?.totalEntries || 0) / 50 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/50 entries`
    },
    {
      id: 'master',
      emoji: '👑',
      title: 'Writing Master',
      description: 'Write 100 entries',
      condition: () => (stats?.totalEntries || 0) >= 100,
      progress: () => Math.min((stats?.totalEntries || 0) / 100 * 100, 100),
      progressText: () => `${stats?.totalEntries || 0}/100 entries`
    },
    {
      id: 'week-warrior',
      emoji: '🔥',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      condition: () => (streakData?.longestStreak || 0) >= 7,
      progress: () => Math.min((streakData?.longestStreak || 0) / 7 * 100, 100),
      progressText: () => `${streakData?.longestStreak || 0}/7 days`
    },
    {
      id: 'two-week',
      emoji: '⚡',
      title: 'Two Week Champion',
      description: 'Maintain a 14-day streak',
      condition: () => (streakData?.longestStreak || 0) >= 14,
      progress: () => Math.min((streakData?.longestStreak || 0) / 14 * 100, 100),
      progressText: () => `${streakData?.longestStreak || 0}/14 days`
    },
    {
      id: 'monthly-master',
      emoji: '🏆',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      condition: () => (streakData?.longestStreak || 0) >= 30,
      progress: () => Math.min((streakData?.longestStreak || 0) / 30 * 100, 100),
      progressText: () => `${streakData?.longestStreak || 0}/30 days`
    },
    {
      id: 'century-club',
      emoji: '💎',
      title: 'Century Club',
      description: 'Maintain a 100-day streak',
      condition: () => (streakData?.longestStreak || 0) >= 100,
      progress: () => Math.min((streakData?.longestStreak || 0) / 100 * 100, 100),
      progressText: () => `${streakData?.longestStreak || 0}/100 days`
    },
    {
      id: 'year-long',
      emoji: '🌟',
      title: 'Year Long Writer',
      description: 'Maintain a 365-day streak',
      condition: () => (streakData?.longestStreak || 0) >= 365,
      progress: () => Math.min((streakData?.longestStreak || 0) / 365 * 100, 100),
      progressText: () => `${streakData?.longestStreak || 0}/365 days`
    },
    {
      id: 'first-words',
      emoji: '💬',
      title: 'First Thousand',
      description: 'Write 1,000 words',
      condition: () => (stats?.totalWords || 0) >= 1000,
      progress: () => Math.min((stats?.totalWords || 0) / 1000 * 100, 100),
      progressText: () => `${formatNumber(stats?.totalWords || 0)}/1,000 words`
    },
    {
      id: 'wordsmith',
      emoji: '📝',
      title: 'Wordsmith',
      description: 'Write 10,000 words',
      condition: () => (stats?.totalWords || 0) >= 10000,
      progress: () => Math.min((stats?.totalWords || 0) / 10000 * 100, 100),
      progressText: () => `${formatNumber(stats?.totalWords || 0)}/10,000 words`
    },
    {
      id: 'novelist',
      emoji: '📖',
      title: 'Novelist',
      description: 'Write 50,000 words',
      condition: () => (stats?.totalWords || 0) >= 50000,
      progress: () => Math.min((stats?.totalWords || 0) / 50000 * 100, 100),
      progressText: () => `${formatNumber(stats?.totalWords || 0)}/50,000 words`
    },
    {
      id: 'epic-writer',
      emoji: '🎭',
      title: 'Epic Writer',
      description: 'Write 100,000 words',
      condition: () => (stats?.totalWords || 0) >= 100000,
      progress: () => Math.min((stats?.totalWords || 0) / 100000 * 100, 100),
      progressText: () => `${formatNumber(stats?.totalWords || 0)}/100,000 words`
    },
    {
      id: 'consistent',
      emoji: '🎨',
      title: 'Consistent Creator',
      description: 'Average 200+ words per entry',
      condition: () => (stats?.averageWords || 0) >= 200,
      progress: () => Math.min((stats?.averageWords || 0) / 200 * 100, 100),
      progressText: () => `${stats?.averageWords || 0}/200 avg words`
    },
    {
      id: 'detailed',
      emoji: '📃',
      title: 'Detailed Writer',
      description: 'Average 500+ words per entry',
      condition: () => (stats?.averageWords || 0) >= 500,
      progress: () => Math.min((stats?.averageWords || 0) / 500 * 100, 100),
      progressText: () => `${stats?.averageWords || 0}/500 avg words`
    },
    {
      id: 'explorer',
      emoji: '🗺️',
      title: 'Prompt Explorer',
      description: 'Use 10 different prompts',
      condition: () => (stats?.uniquePrompts || 0) >= 10,
      progress: () => Math.min((stats?.uniquePrompts || 0) / 10 * 100, 100),
      progressText: () => `${stats?.uniquePrompts || 0}/10 prompts`
    }
  ];

  // Sort achievements: completed first, then by progress
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aCompleted = a.condition();
    const bCompleted = b.condition();
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    if (!aCompleted && !bCompleted) return b.progress() - a.progress();
    return 0;
  });

  const completedCount = achievements.filter(a => a.condition()).length;

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold">
            {completedCount}/{achievements.length} Unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map(achievement => {
            const isCompleted = achievement.condition();
            const progress = achievement.progress();
            
            return (
              <div 
                key={achievement.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'border-green-500 transform hover:scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`text-4xl mb-2 ${!isCompleted && 'grayscale opacity-50'}`}>
                  {achievement.emoji}
                </div>
                <div className={`font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                  {achievement.title}
                </div>
                <div className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'} mb-3`}>
                  {achievement.description}
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed!
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{achievement.progressText()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
