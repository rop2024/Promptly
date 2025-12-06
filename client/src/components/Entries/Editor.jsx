import React, { useState, useEffect, useRef } from 'react';
import { getRandomPrompts } from '../../config/stuckPrompts.js';
import authService from '../../services/authService.js';

const Editor = ({ entry, onSubmit, onCancel, isLoading = false, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: false,
    timeSpent: 0
  });

  const [errors, setErrors] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Stuck prompts state
  const [stuckEnabled, setStuckEnabled] = useState(true); // Initialize from settings
  const [shuffleList, setShuffleList] = useState([]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [ghostParagraphId, setGhostParagraphId] = useState(null);
  const [lastTypedAt, setLastTypedAt] = useState(Date.now());
  
  // Get user level from current user
  const currentUser = authService.getCurrentUser();
  const level = currentUser?.level || 1;
  
  // Use ref to track if we've initialized the shuffle list
  const isInitialized = useRef(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        isPublic: entry.isPublic || false,
        timeSpent: entry.timeSpent || 0
      });
      setTimeSpent(entry.timeSpent || 0);
    }
  }, [entry]);

  // Time tracking effect
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (!isActive && timeSpent !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive]);

  // Start timer when user begins typing
  useEffect(() => {
    if (formData.content.length > 0 && !isActive && !startTime) {
      setIsActive(true);
      setStartTime(Date.now());
    }
  }, [formData.content]);

  // Initialize and shuffle stuck prompts pool once per session
  useEffect(() => {
    if (!isInitialized.current && stuckEnabled) {
      const initialPrompts = getRandomPrompts(14); // Get all prompts shuffled
      setShuffleList(initialPrompts);
      isInitialized.current = true;
    }
  }, [stuckEnabled]);

  // Re-shuffle when we've cycled through all prompts
  useEffect(() => {
    if (promptIndex >= shuffleList.length && shuffleList.length > 0) {
      const newPrompts = getRandomPrompts(14);
      setShuffleList(newPrompts);
      setPromptIndex(0);
    }
  }, [promptIndex, shuffleList.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Update last typed timestamp for stuck prompts
    if (name === 'content') {
      setLastTypedAt(Date.now());
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  const [showTitlePrompt, setShowTitlePrompt] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If content is written but no title, show title prompt
    if (formData.content.trim() && !showTitlePrompt && !formData.title.trim()) {
      setShowTitlePrompt(true);
      return;
    }
    
    // Stop timer
    setIsActive(false);
    
    // Validation
    const newErrors = {};
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.content.length > 10000) newErrors.content = 'Content must be 10000 characters or less';
    
    // Title is optional, but if provided must be under limit
    if (formData.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If no title provided, generate one from content
    const finalFormData = {
      ...formData,
      title: formData.title.trim() || formData.content.substring(0, 50).trim() + '...',
      timeSpent
    };

    // Include time spent in submission
    onSubmit(finalFormData);
  };



  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit Entry' : 'Write New Entry'}
          </h2>
          
          {/* Time Recorder with Hover Controls */}
          <div className="group relative">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    isActive ? 'text-green-600 animate-pulse' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Writing Time</div>
                  <div className="text-2xl font-bold text-gray-800 tabular-nums">{formatTime(timeSpent)}</div>
                </div>
              </div>
            </div>
            
            {/* Hover Controls */}
            <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2 ${
                    isActive 
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isActive ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content - Show First */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="12"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition duration-200 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write your thoughts here... (Start writing, we'll ask for a title when you're done)"
              autoFocus
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <span className="text-sm text-red-600">{errors.content}</span>
              )}
              <span className={`text-sm ml-auto ${formData.content.length > 9000 ? 'text-orange-500' : 'text-gray-500'}`}>
                {formData.content.length}/10000
              </span>
            </div>
          </div>

          {/* Title - Show After Content or Always in Edit Mode */}
          {(showTitlePrompt || mode === 'edit' || formData.title) && (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional - we'll auto-generate if left blank)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Give your entry a title (optional)"
                autoFocus={showTitlePrompt}
              />
              <div className="flex justify-between mt-1">
                {errors.title && (
                  <span className="text-sm text-red-600">{errors.title}</span>
                )}
                <span className={`text-sm ml-auto ${formData.title.length > 80 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {formData.title.length}/100
                </span>
              </div>
            </div>
          )}



          {/* Privacy Setting */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-3 block text-sm text-gray-700">
              <span className="font-medium">Make this entry public</span>
              <p className="text-gray-500">Other users will be able to read this entry</p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.content.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : showTitlePrompt && !formData.title.trim() ? (
                mode === 'edit' ? 'Update Entry' : 'Save Entry'
              ) : (
                mode === 'edit' ? 'Update Entry' : (formData.content.trim() && !showTitlePrompt ? 'Continue' : 'Save Entry')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Editor;