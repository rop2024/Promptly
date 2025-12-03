import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import Editor from '../../components/Entries/Editor.jsx';

const EntryNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [useDailyPrompt, setUseDailyPrompt] = useState(false);
  const [promptContent, setPromptContent] = useState('');

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
    
    // Auto-focus the title field and set some initial content
    const title = `Response to Daily Prompt`;
    document.getElementById('title')?.focus();
    
    return {
      title,
      content: `${randomPrompt}\n\n`,
      mood: 'neutral',
      tags: ['daily-prompt']
    };
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
    setUseDailyPrompt(true);
    
    // This would ideally update the editor form state
    // Since we're using controlled Editor component, we'd need to pass this data
    // For now, we'll show a message and let the user copy the prompt
    alert(`Daily prompt loaded: "${promptContent}"\n\nStart writing your response below!`);
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
          <h1 className="text-3xl font-bold text-gray-800">Write New Entry</h1>
          <p className="text-gray-600 mt-1">Capture your thoughts, feelings, and reflections</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleQuickStart}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition duration-200 font-medium shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start with Daily Prompt
          </button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-lg mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Writing Tips</h3>
            <ul className="text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Be honest and authentic with yourself
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Don't worry about grammar or spelling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Write for at least 5 minutes for best results
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Use tags to organize similar entries
              </li>
            </ul>
          </div>
        </div>
        
        {useDailyPrompt && promptContent && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-gray-800 mb-2">Daily Prompt:</h4>
            <p className="text-gray-700 italic bg-white p-3 rounded-lg border border-blue-100">
              "{promptContent}"
            </p>
          </div>
        )}
      </div>

      {/* Editor Component */}
      <Editor
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saving}
        mode="create"
      />

      {/* Writing Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="text-sm text-gray-600">Estimated Read Time</div>
              <div className="font-semibold text-gray-800">3-5 minutes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Privacy</div>
              <div className="font-semibold text-gray-800">Private by default</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryNew;