import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, SkipForward, Check, ChevronDown, ChevronUp } from 'lucide-react';
import promptService from '../../services/promptService.js';
import TimerWidget from '../Timer/TimerWidget.jsx';

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
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    loadTodaysPrompt();
  }, []);

  const loadTodaysPrompt = async () => {
    try {
      setLoading(true);
      const result = await promptService.getTodaysPrompt();
      setPromptData(result?.data || result);
    } catch (error) {
      console.error('Error loading prompt:', error);
      setPromptData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrompt = async () => {
    try {
      setLoading(true);
      const result = await promptService.getTodaysPrompt();
      setPromptData(result?.data || result);
    } catch (error) {
      console.error('Error refreshing prompt:', error);
      alert('Failed to load new prompt. Please try again.');
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
      const updatedData = result?.data || result;
      setPromptData(updatedData);
      
      setUserResponse('');
      setShowPromptModal(false);
      
      if (onPromptCompleted) {
        onPromptCompleted(userResponse);
      }
      
      // Show success message
      alert(`Great job! Your streak is now ${updatedData?.streak || 0} days!`);
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
      setPromptData(result?.data || result);
      setShowPromptModal(false);
    } catch (error) {
      console.error('Error skipping prompt:', error);
      alert('Failed to skip prompt. Please try again.');
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
      <div className="bg-white rounded-lg shadow-soft2 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-accent-2 to-brand-primary text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Check className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Great Work! ✨</h3>
          <p className="text-white/90">
            You've completed your daily prompt. Come back tomorrow for a new one!
          </p>
        </div>
        
        <div className="p-8 text-center">
          <div className="bg-brand-accent-1/50 rounded-lg p-6 inline-block border border-brand-primary/20">
            <p className="text-sm text-gray-600 mb-2 font-medium">Current Streak</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl">🔥</span>
              <span className="text-4xl font-bold text-brand-primary">{promptData.streak}</span>
              <span className="text-lg text-gray-600">days</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              ✅ {promptData.totalCompleted || 0} total completions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact version for dashboard
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-4 border-l-4 border-brand-primary">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-2">
              <span className="text-lg">{CATEGORY_ICONS[promptData.category]}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-accent-1 text-gray-700 border border-brand-primary/20">
                {promptData.category}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <span className="mr-1">🔥</span> {promptData.streak}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-relaxed">{promptData.prompt}</h3>
          </div>
        </div>
        <button
          onClick={handleWriteEntry}
          className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:scale-105 transition-transform duration-300 text-sm font-medium"
        >
          Write Response
        </button>
        
        {/* Prompt Modal */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-soft2">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-brand-accent-2 to-brand-primary text-white p-6">
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Today's Prompt</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{CATEGORY_ICONS[promptData.category]}</span>
                      <span className="text-sm font-medium px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                        {promptData.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-brand-accent-1/30 p-4 rounded-lg mb-4 border border-brand-primary/20">
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-300"
                    placeholder="Write your thoughts here..."
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleSkipPrompt}
                    disabled={completing}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors duration-300"
                  >
                    Skip for Today
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => setShowPromptModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCompletePrompt}
                      disabled={completing}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:scale-105 transition-transform disabled:bg-gray-300 disabled:hover:scale-100"
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
    <div className="bg-white rounded-lg shadow-soft2 overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-brand-accent-2 to-brand-primary text-white p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Today's Writing Prompt</h2>
              <p className="text-white/90 text-sm mt-1">Let your thoughts flow</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-white/90">
            <span className="text-2xl">🔥</span>
            <span className="font-semibold">{promptData.streak} day streak</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-2xl">{CATEGORY_ICONS[promptData.category]}</span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {promptData.category}
          </span>
        </div>
      </div>

      {/* Prompt Body */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-lg text-gray-800 font-medium leading-relaxed">
            {promptData.prompt}
          </p>
        </div>

        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          rows="8"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none transition-all duration-300"
          placeholder="Write your response here... (This will create a new entry)"
        />
        
        {/* Timer Widget */}
        <div className="mt-4 flex justify-center">
          <TimerWidget showControls={true} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={handleRefreshPrompt}
              disabled={loading}
              className="flex items-center space-x-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
              title="Get a different prompt"
              aria-label="Get a different prompt"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Change</span>
            </button>
            
            <button
              onClick={handleSkipPrompt}
              disabled={completing}
              className="flex items-center space-x-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
              aria-label="Skip today's prompt"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Today</span>
            </button>
          </div>

          <button
            onClick={handleCompletePrompt}
            disabled={completing || !userResponse.trim()}
            className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-2 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium w-full sm:w-auto justify-center focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="Complete and save prompt response"
          >
            {completing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Completing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Complete & Save</span>
              </>
            )}
          </button>
        </div>

        {/* About Section - Collapsible */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none rounded-lg"
            aria-label={showAbout ? "Hide about daily prompts" : "Show about daily prompts"}
            aria-expanded={showAbout}
          >
            <span>About Daily Prompts</span>
            {showAbout ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div 
            className="collapse"
            style={{ height: showAbout ? 'auto' : '0' }}
          >
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <p>
                Daily prompts help you maintain a consistent writing practice. Complete prompts to build your streak and track your progress.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Builds writing consistency and habit formation</li>
                <li>Tracks your daily streak and total completions</li>
                <li>Explore different categories and themes</li>
                <li>Your responses are saved as journal entries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPrompt;