import React, { useState, useEffect } from 'react';
import entryService from '../../services/entryService.js';
import streakService from '../../services/streakService.js';

const Stats = ({ currentUser }) => {
  const [stats, setStats] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    document.title = 'Your Journey - Promptly';
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
      {/* User Profile Header */}
      <div className="bg-gradient-to-r from-green-600 via-brand-primary to-brand-secondary rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl font-bold text-brand-primary shadow-lg border-4 border-white">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                Level {stats?.level || 1}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-4xl font-bold mb-2">{currentUser?.name || 'User'}</h1>
              <p className="text-green-100 text-lg mb-3">{currentUser?.email || ''}</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-3">
                <p className="text-white/95 italic">
                  {currentUser?.bio || '"Every word written is a step towards self-discovery. Keep writing, keep growing."'}
                </p>
              </div>
              
              {/* Level Progress Bar */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Level {stats?.level || 1}</span>
                  <span className="text-sm">{formatNumber(stats?.xpInCurrentLevel || 0)} / {formatNumber(stats?.xpNeededForNextLevel || 100)} XP</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-brand-accent-2 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.progressPercentage || 0}%` }}
                  />
                </div>
                <div className="text-xs text-white/80 mt-1">
                  {stats?.xpNeededForNextLevel - stats?.xpInCurrentLevel || 0} XP to Level {(stats?.level || 1) + 1}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">📅 Joined {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">🔥 {streakData?.currentStreak || 0} Day Streak</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">🏆 {completedCount} Achievements</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">⭐ {formatNumber(stats?.experiencePoints || 0)} Total XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Your Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedAchievements.filter(a => a.condition()).slice(0, 6).map(achievement => (
            <div 
              key={achievement.id}
              className="bg-gradient-to-br from-brand-accent-1 to-brand-accent-2/30 rounded-lg shadow-soft p-6 border border-brand-primary/20 hover:shadow-soft2 hover:scale-105 transition-all duration-300"
            >
              <div className="text-5xl mb-3 text-center">{achievement.emoji}</div>
              <div className="font-bold text-gray-800 text-center mb-1">{achievement.title}</div>
              <div className="text-sm text-gray-600 text-center">{achievement.description}</div>
              <div className="mt-3 flex justify-center">
                <div className="flex items-center text-xs text-brand-primary font-medium bg-white/50 px-3 py-1 rounded-full border border-brand-primary/20">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlocked!
                </div>
              </div>
            </div>
          ))}
        </div>
        {sortedAchievements.filter(a => a.condition()).length === 0 && (
          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-600">Start writing to unlock achievements!</p>
          </div>
        )}
      </div>

      {/* Writing Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Writing Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-blue-500 hover:shadow-soft2 hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-blue-600">{formatNumber(stats?.totalEntries)}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Total Entries</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-green-500 hover:shadow-soft2 hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-green-600">{streakData?.longestStreak || 0}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Longest Streak</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-purple-500 hover:shadow-soft2 hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-purple-600">{formatNumber(stats?.totalWords)}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Total Words</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-orange-500 hover:shadow-soft2 hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-orange-600">{stats?.averageWords || 0}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Avg Words</div>
          </div>
        </div>
      </div>

      {/* Current Streak Card */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          Current Streak
        </h2>
        <div className="bg-gradient-to-r from-brand-accent-1 to-green-50 rounded-xl shadow-md p-6 border-2 border-brand-primary/30">
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="text-center">
              <div className="text-7xl mb-2">🔥</div>
              <div className="text-5xl font-bold text-brand-primary mb-2">
                {streakData?.currentStreak || 0}
              </div>
              <div className="text-gray-700 font-medium text-lg">Days</div>
              <div className="text-sm text-gray-600 mt-1">
                {streakData?.writtenToday ? '✅ Written today!' : '⏰ Write today to continue'}
              </div>
            </div>
            
            <div className="hidden md:block w-px h-24 bg-orange-300"></div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Personal Best</div>
              <div className="text-4xl font-bold text-red-600 mb-1">
                {streakData?.longestStreak || 0}
              </div>
              <div className="text-gray-700 font-medium">Longest Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* All Achievements - Collapsible */}
      <div>
        <button
          onClick={() => setShowAllAchievements(!showAllAchievements)}
          className="w-full bg-gradient-to-r from-green-50 to-brand-accent-1 rounded-xl p-4 border-2 border-brand-primary/30 hover:border-brand-primary/50 transition-all duration-300 flex items-center justify-between mb-4 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
          aria-label={showAllAchievements ? "Hide all achievements" : "Show all achievements"}
          aria-expanded={showAllAchievements}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            <h2 className="text-2xl font-bold text-gray-800">View All Achievements</h2>
            <div className="ml-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-4 py-1 rounded-lg font-bold text-sm shadow-lg">
              {completedCount}/{achievements.length} Unlocked
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${showAllAchievements ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAllAchievements && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map(achievement => {
            const isCompleted = achievement.condition();
            const progress = achievement.progress();
            
            return (
              <div 
                key={achievement.id}
                className={`rounded-lg shadow-soft p-6 border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-brand-accent-1 to-brand-accent-2/30 border-brand-primary/20 hover:shadow-soft2 hover:scale-105' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
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
                  <div className="flex items-center text-xs text-brand-primary font-medium bg-white/50 px-3 py-1 rounded-full border border-brand-primary/20">
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
                    <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-brand-accent-2 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Motivational Section */}
      <div className="bg-gradient-to-r from-green-600 via-brand-primary to-brand-secondary rounded-2xl shadow-lg text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Keep Going! 💪</h2>
        <div className="space-y-3">
          {streakData?.currentStreak > 0 && (
            <p className="text-green-100">
              You're on a {streakData.currentStreak}-day streak! Don't break the chain.
            </p>
          )}
          {stats?.totalWords >= 1000 && (
            <p className="text-green-100">
              You've written {formatNumber(stats.totalWords)} words. That's amazing progress!
            </p>
          )}
          {stats?.totalEntries >= 10 && (
            <p className="text-green-100">
              With {stats.totalEntries} entries, you're building a rich collection of thoughts and memories.
            </p>
          )}
          <p className="text-green-100 italic">
            "Writing is the painting of the voice." - Keep creating!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
