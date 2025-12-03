import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import streakService from '../../services/streakService.js';
import promptService from '../../services/promptService.js';
import EntryCard from '../../components/Entries/EntryCard.jsx';
import StreakDisplay from '../../components/Streak/StreakDisplay.jsx';
import DailyPrompt from '../../components/Prompts/DailyPrompt.jsx';

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
      setRecentEntries(entriesResult.data);

      // Load streak data
      const streakResult = await streakService.getStreak();
      setStreakData(streakResult.data);

      // Load prompt data
      const promptResult = await promptService.getTodaysPrompt();
      setPromptData(promptResult.data);

      // Load stats
      const statsResult = await entryService.getStats();
      setStats(statsResult.data);

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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {streakData?.writtenToday 
                ? "Great job writing today! Keep building your streak. 🔥"
                : "Ready to write today's entry?"
              }
            </p>
          </div>
          <Link
            to="/entries/new"
            className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 shadow-lg"
          >
            + New Entry
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-800">{stats?.totalEntries || 0}</div>
          <div className="text-gray-600 text-sm">Total Entries</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-800">{streakData?.currentStreak || 0}</div>
          <div className="text-gray-600 text-sm">Current Streak</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-800">{stats?.moodStats?.[0]?.count || 0}</div>
          <div className="text-gray-600 text-sm">
            {stats?.moodStats?.[0]?._id ? `${stats.moodStats[0]._id} Entries` : 'Most Common Mood'}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-800">
            {promptData?.totalCompleted || 0}
          </div>
          <div className="text-gray-600 text-sm">Prompts Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Prompt */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Prompt</h2>
          <DailyPrompt 
            onPromptCompleted={handlePromptCompleted}
            compact={false}
          />
        </div>

        {/* Writing Streak */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Writing Streak</h2>
          <StreakDisplay compact={false} />
        </div>
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
            <p className="text-gray-500 mb-4">Start your journaling journey with your first entry!</p>
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