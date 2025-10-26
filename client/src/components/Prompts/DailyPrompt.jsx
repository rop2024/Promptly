import React, { useState, useEffect } from 'react';
import promptService from '../../services/promptService.js';

const CATEGORY_ICONS = {
  reflection: '🤔',
  gratitude: '🙏',
  creativity: '🎨',
  goals: '🎯',
  mindfulness: '🧘',
  relationships: '👥',
  growth: '🌱'
};

const CATEGORY_COLORS = {
  reflection: 'bg-purple-100 text-purple-800',
  gratitude: 'bg-green-100 text-green-800',
  creativity: 'bg-yellow-100 text-yellow-800',
  goals: 'bg-blue-100 text-blue-800',
  mindfulness: 'bg-teal-100 text-teal-800',
  relationships: 'bg-pink-100 text-pink-800',
  growth: 'bg-orange-100 text-orange-800'
};

const DailyPrompt = ({ onPromptCompleted, compact = false }) => {
  const [promptData, setPromptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [userResponse, setUserResponse] = useState('');

  useEffect(() => {
    loadTodaysPrompt();
  }, []);

  const loadTodaysPrompt = async () => {
    try {
      setLoading(true);
      const result = await promptService.getTodaysPrompt();
      setPromptData(result.data);
    } catch (error) {
      console.error('Error loading prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePrompt = async () => {
    if (!userResponse.trim() && !compact) {
      alert('Please write something before completing!');
      return;
    }

    try {
      setCompleting(true);
      await promptService.completePrompt();
      
      // Store completion locally
      promptService.storeLocalCompletion();
      
      // Reload prompt data to get updated streak
      const result = await promptService.getTodaysPrompt();
      setPromptData(result.data);
      
      setUserResponse('');
      setShowPromptModal(false);
      
      if (onPromptCompleted) {
        onPromptCompleted(userResponse);
      }
      
      // Show success message
      alert(`Great job! Your streak is now ${result.data.streak} days!`);
    } catch (error) {
      console.error('Error completing prompt:', error);
      alert('Failed to complete prompt. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleSkipPrompt = async () => {
    try {
      await promptService.skipPrompt();
      promptService.storeLocalCompletion();
      const result = await promptService.getTodaysPrompt();
      setPromptData(result.data);
      setShowPromptModal(false);
    } catch (error) {
      console.error('Error skipping prompt:', error);
    }
  };

  const handleWriteEntry = () => {
    setShowPromptModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!promptData) {
    return null;
  }

  // If prompt already completed today
  if (promptData.completed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Daily Prompt Complete!
        </h3>
        <p className="text-green-600 mb-4">
          You've completed your daily prompt. Come back tomorrow for a new one!
        </p>
        <div className="flex justify-center space-x-4 text-sm text-green-700">
          <span>🔥 Streak: {promptData.streak} days</span>
          <span>✅ Total: {promptData.totalCompleted || 0}</span>
        </div>
      </div>
    );
  }

  // Compact version for dashboard
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">{CATEGORY_ICONS[promptData.category]}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[promptData.category]}`}>
                {promptData.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{promptData.prompt}</h3>
          </div>
        </div>
        <button
          onClick={handleWriteEntry}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 text-sm"
        >
          Write Response
        </button>
        
        {/* Prompt Modal */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{CATEGORY_ICONS[promptData.category]}</span>
                  <div>
                    <h2 className="text-xl font-bold">Daily Prompt</h2>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[promptData.category]}`}>
                      {promptData.category}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-lg font-medium text-gray-800">{promptData.prompt}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your thoughts here..."
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleSkipPrompt}
                    disabled={completing}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Skip for Today
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => setShowPromptModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCompletePrompt}
                      disabled={completing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      {completing ? 'Completing...' : 'Complete Prompt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <span className="text-3xl mr-3">💡</span>
          <h2 className="text-2xl font-bold text-gray-800">Daily Prompt</h2>
        </div>
        <p className="text-gray-600">
          Reflect on today's question to build your writing habit
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{CATEGORY_ICONS[promptData.category]}</span>
            <span className={`font-medium px-3 py-1 rounded-full ${CATEGORY_COLORS[promptData.category]}`}>
              {promptData.category}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            🔥 {promptData.streak} day streak
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {promptData.prompt}
        </h3>

        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          rows="8"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Write your response here... (This will create a new journal entry)"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleSkipPrompt}
          disabled={completing}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition duration-200"
        >
          Skip for Today
        </button>
        <button
          onClick={handleCompletePrompt}
          disabled={completing || !userResponse.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {completing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing...
            </span>
          ) : (
            'Complete Prompt & Save Entry'
          )}
        </button>
      </div>

      {promptData.streak > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Keep going! You're on a {promptData.streak}-day streak. 🔥
        </div>
      )}
    </div>
  );
};

export default DailyPrompt;