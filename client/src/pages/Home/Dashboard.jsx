import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import streakService from '../../services/streakService.js';
import promptService from '../../services/promptService.js';
import StreakDisplay from '../../components/Streak/StreakDisplay.jsx';
import DailyPrompt from '../../components/Prompts/DailyPrompt.jsx';

const Dashboard = ({ currentUser }) => {
  const [streakData, setStreakData] = useState(null);
  const [promptData, setPromptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard - Promptly';
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

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
      {/* Application Objective Banner - Collapsible */}
      <div>
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg text-white p-4 hover:opacity-90 transition duration-200 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="text-xl mr-2">✨</span>
            <h2 className="text-lg font-bold">About Promptly</h2>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${showAbout ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAbout && (
          <div className="mt-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-200">
            <ul className="space-y-2 text-gray-700 text-base">
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
        )}
      </div>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome Back, {currentUser.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {streakData?.writtenToday 
                ? "Excellent work! You've written today. Keep the momentum going! 🔥"
                : "Ready to capture your thoughts today?"
              }
            </p>
          </div>
          <Link
            to="/entries/new"
            className="mt-4 md:mt-0 bg-white text-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            + Start Writing
          </Link>
        </div>
      </div>

      {/* Writing Streak - Full Width */}
      <div>
        <StreakDisplay compact={false} />
      </div>

      {/* Daily Prompt - Full Width */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Prompt</h2>
        <DailyPrompt 
          onPromptCompleted={handlePromptCompleted}
          compact={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;