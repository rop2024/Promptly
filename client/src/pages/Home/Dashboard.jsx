import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import streakService from '../../services/streakService.js';
import promptService from '../../services/promptService.js';
import EntryCard from '../../components/Entries/EntryCard.jsx';
import StreakDisplay from '../../components/Streak/StreakDisplay.jsx';
import DailyPrompt from '../../components/Prompts/DailyPrompt.jsx';
import TimerWidget from '../../components/Timer/TimerWidget.jsx';

const Dashboard = ({ currentUser }) => {
  const [recentEntries, setRecentEntries] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [promptData, setPromptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent entries
      const entriesResult = await entryService.getEntries({ limit: 5 });
      setRecentEntries(entriesResult.data?.data || []); // data.data is the array

      // Load streak data (streakService already returns response.data)
      const streakResult = await streakService.getStreak();
      setStreakData(streakResult?.data || null);

      // Load prompt data
      const promptResult = await promptService.getTodaysPrompt();
      setPromptData(promptResult.data?.data || null);

      // Load stats
      const statsResult = await entryService.getStats();
      setStats(statsResult.data?.data || null);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryDelete = async (entry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await entryService.deleteEntry(entry.id);
        setRecentEntries(prev => prev.filter(e => e.id !== entry.id));
        loadDashboardData(); // Refresh stats and streak
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const handlePromptCompleted = () => {
    loadDashboardData(); // Refresh all data
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loading skeleton for stats */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Objective Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">✨ About Promptly ✨</h2>
          <ul className="space-y-2 text-white/95 text-base">
            <li className="flex items-start">
              <span className="mr-3 text-xl">✍️</span>
              <span>Helps you build a consistent writing habit.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl">📝</span>
              <span>Lets you track daily thoughts and respond to prompts.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl">🔥</span>
              <span>Maintains writing streaks to reinforce continuity.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl">🌱</span>
              <span>Supports mindfulness, creativity, and personal growth.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-xl">💡</span>
              <span>Provides daily prompts and streak tracking.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {streakData?.writtenToday 
                ? "Great job completing today's prompt! Keep your streak alive. 🔥"
                : "Ready for today's writing prompt?"
              }
            </p>
          </div>
          <Link
            to="/entries/new"
            className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 shadow-lg"
          >
            + Start Writing
          </Link>
        </div>
      </div>

      {/* Quick Stats and Writing Streak Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm p-6 border border-indigo-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quick Stats</h2>
            <Link
              to="/stats"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
            >
              View All Stats
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats?.totalEntries || 0}</div>
              <div className="text-xs text-gray-600">Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streakData?.currentStreak || 0}</div>
              <div className="text-xs text-gray-600">Streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.totalWords ? Math.floor(stats.totalWords / 1000) + 'k' : 0}</div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.averageWords || 0}</div>
              <div className="text-xs text-gray-600">Avg/Entry</div>
            </div>
          </div>
        </div>

        {/* Writing Streak */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Writing Streak</h2>
          <StreakDisplay compact={false} />
        </div>
      </div>

      {/* Daily Prompt - Full Width */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Prompt</h2>
        <DailyPrompt 
          onPromptCompleted={handlePromptCompleted}
          compact={false}
        />
      </div>

      {/* Recent Entries */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Entries</h2>
          <Link
            to="/entries"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No entries yet</h3>
            <p className="text-gray-500 mb-4">Start your writing journey with your first entry!</p>
            <Link
              to="/entries/new"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
            >
              Write First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => window.location.href = `/entries/${entry.id}/edit`}
                onDelete={handleEntryDelete}
                onView={() => window.location.href = `/entries/${entry.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;