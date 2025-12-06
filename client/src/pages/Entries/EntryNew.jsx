import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import Editor from '../../components/Entries/Editor.jsx';

const EntryNew = () => {
  useEffect(() => {
    document.title = 'New Entry - Promptly';
  }, []);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [useDailyPrompt, setUseDailyPrompt] = useState(false);
  const [promptContent, setPromptContent] = useState('');
  const [promptEntry, setPromptEntry] = useState(null);
  const [showTips, setShowTips] = useState(false);

  // Function to handle daily prompt integration
  const handleUseDailyPrompt = () => {
    // This would typically fetch from a daily prompt service
    // For now, using a sample prompt
    const samplePrompts = [
      "What's one thing you learned about yourself today?",
      "What are you most grateful for right now?",
      "Describe a moment today when you felt truly present.",
      "What challenge did you overcome today?",
      "What would make tomorrow a great day?"
    ];
    
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPromptContent(randomPrompt);
    
    const promptData = {
      title: `Response to Daily Prompt`,
      content: `${randomPrompt}\n\n`
    };
    
    return promptData;
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setMessage('');

      // Create the new entry
      const result = await entryService.createEntry(formData);
      
      setMessage('Entry created successfully!');
      
      // Optional: Update streak and stats here
      
      // Redirect to the new entry's detail page after a short delay
      setTimeout(() => {
        navigate(`/entries/${result.data.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating entry:', error);
      setMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to create entry. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Any unsaved content will be lost.')) {
      navigate('/entries');
    }
  };

  const handleQuickStart = () => {
    const promptData = handleUseDailyPrompt();
    setPromptEntry(promptData);
    setUseDailyPrompt(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/entries"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Entries
        </Link>
      </div>

      {/* Success Message */}
      {message && (
        <div className={`mb-6 rounded-lg p-4 ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.includes('success') ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.73-.833-2.502 0L4.23 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            <span>{message}</span>
          </div>
          {message.includes('success') && (
            <div className="mt-2 text-sm">
              Redirecting to your new entry...
            </div>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">✍️ New Entry</h1>
          <p className="text-gray-600 mt-1">Take a moment to reflect and write freely</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={handleQuickStart}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition duration-200 font-medium shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {useDailyPrompt ? 'Change Prompt' : 'Start with Daily Prompt'}
          </button>
        </div>
      </div>

      {/* Daily Prompt Block */}
      {useDailyPrompt && promptContent && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200 shadow-md">
          <div className="flex items-start">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Today's Prompt</h3>
              <p className="text-gray-700 text-base leading-relaxed italic">
                "{promptContent}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Writing Tips Dropdown */}
      <div className="mb-6">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition duration-200 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800">💡 Helpful Writing Tips</h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${showTips ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTips && (
          <div className="mt-2 bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Be honest and authentic with yourself
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Don't worry about grammar or spelling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Write for at least 5 minutes for best results
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Use tags to organize similar entries
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Editor Component */}
      <Editor
        entry={promptEntry}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saving}
        mode="create"
      />

      {/* Writing Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Streak Impact</div>
              <div className="font-semibold text-gray-800">+1 Day</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Time Tracking</div>
              <div className="font-semibold text-gray-800">Auto-tracked</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Estimated Read</div>
              <div className="font-semibold text-gray-800">3-5 min</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Privacy</div>
              <div className="font-semibold text-gray-800">Private</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryNew;