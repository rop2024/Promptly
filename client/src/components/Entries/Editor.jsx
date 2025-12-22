import React, { useState, useEffect, useRef } from 'react';
import { getRandomPrompts } from '../../config/stuckPrompts.js';
import authService from '../../services/authService.js';
import analyticsService from '../../services/analyticsService.js';

const Editor = ({ entry, onSubmit, onCancel, isLoading = false, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: false,
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [distractionFree, setDistractionFree] = useState(false);

  // Stuck prompts state
  const currentUser = authService.getCurrentUser();
  const [stuckEnabled, setStuckEnabled] = useState(currentUser?.preferences?.stuckPromptEnabled ?? true);
  const [shuffleList, setShuffleList] = useState([]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [ghostParagraphId, setGhostParagraphId] = useState(null);
  const [lastTypedAt, setLastTypedAt] = useState(Date.now());
  
  // Get user level from current user
  const level = currentUser?.level || 1;
  
  // Use ref to track if we've initialized the shuffle list
  const isInitialized = useRef(false);
  
  // Track last action type
  const [lastAction, setLastAction] = useState(null);
  
  // Track ghost text state
  const [ghostText, setGhostText] = useState('');
  const [ghostPosition, setGhostPosition] = useState(null);
  const textareaRef = useRef(null);
  const ghostRemovalTimer = useRef(null);
  const lastInsertedPrompt = useRef(null);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        isPublic: entry.isPublic || false,
        tags: entry.tags || []
      });
    }
  }, [entry]);

  // Initialize and shuffle stuck prompts pool once per session
  useEffect(() => {
    if (!isInitialized.current && stuckEnabled) {
      const initialPrompts = getRandomPrompts(14); // Get all prompts shuffled
      setShuffleList(initialPrompts);
      isInitialized.current = true;
    }
  }, [stuckEnabled]);

  // Cleanup ghost removal timer on unmount
  useEffect(() => {
    return () => {
      if (ghostRemovalTimer.current) {
        clearTimeout(ghostRemovalTimer.current);
      }
    };
  }, []);

  // Listen for reset prompt cycle event from Settings
  useEffect(() => {
    const handleResetPromptCycle = () => {
      const newPrompts = getRandomPrompts(14);
      setShuffleList(newPrompts);
      setPromptIndex(0);
      lastInsertedPrompt.current = null;
    };

    window.addEventListener('resetPromptCycle', handleResetPromptCycle);
    return () => {
      window.removeEventListener('resetPromptCycle', handleResetPromptCycle);
    };
  }, []);

  // Listen for user preference updates
  useEffect(() => {
    const handleUserUpdated = () => {
      const user = authService.getCurrentUser();
      if (user?.preferences?.stuckPromptEnabled !== undefined) {
        setStuckEnabled(user.preferences.stuckPromptEnabled);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdated);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  // Inactivity timer logic - check for stuck moments
  useEffect(() => {
    if (!stuckEnabled) return;

    // Compute threshold based on user level
    const base = 15; // seconds
    const threshold = Math.min(base + (level * 2), 30); // max 30 seconds

    // Check every 250ms
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastType = (now - lastTypedAt) / 1000; // convert to seconds

      // Check if conditions are met for showing stuck prompt
      const shouldShowPrompt = 
        timeSinceLastType >= threshold &&
        lastAction === 'typing' &&
        !ghostParagraphId &&
        formData.content.length > 0; // Only show if user has started writing

      if (shouldShowPrompt) {
        // Trigger stuck prompt insertion
        insertStuckPrompt();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [stuckEnabled, level, lastTypedAt, lastAction, ghostParagraphId, formData.content]);

  // Function to insert stuck prompt as ghost paragraph
  const insertStuckPrompt = () => {
    if (shuffleList.length === 0 || !textareaRef.current) return;
    
    let nextIndex = promptIndex;
    
    // Check if we're at the end of the list - reshuffle if needed
    if (nextIndex >= shuffleList.length) {
      const newPrompts = getRandomPrompts(14);
      setShuffleList(newPrompts);
      nextIndex = 0;
      setPromptIndex(0);
    }
    
    let currentPrompt = shuffleList[nextIndex];
    
    // Ensure no consecutive duplicates
    if (lastInsertedPrompt.current === currentPrompt && shuffleList.length > 1) {
      nextIndex = (nextIndex + 1) % shuffleList.length;
      currentPrompt = shuffleList[nextIndex];
      
      // If still the same after increment, reshuffle
      if (lastInsertedPrompt.current === currentPrompt) {
        const newPrompts = getRandomPrompts(14);
        setShuffleList(newPrompts);
        nextIndex = 0;
        currentPrompt = newPrompts[0];
      }
    }
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = formData.content.substring(0, cursorPos);
    const textAfterCursor = formData.content.substring(cursorPos);
    
    // Find the end of the current paragraph (or use cursor position)
    let insertPosition = cursorPos;
    const lastNewline = textBeforeCursor.lastIndexOf('\n');
    const nextNewline = textAfterCursor.indexOf('\n');
    
    // If we're in the middle of a paragraph, move to end of it
    if (nextNewline !== -1) {
      insertPosition = cursorPos + nextNewline;
    }
    
    // Generate unique ID for this ghost paragraph
    const ghostId = `ghost-${Date.now()}`;
    setGhostParagraphId(ghostId);
    setGhostText(currentPrompt);
    setGhostPosition(insertPosition);
    
    // Track this prompt and move to next
    lastInsertedPrompt.current = currentPrompt;
    setPromptIndex(nextIndex + 1);
    
    // Insert ghost text as a new paragraph
    const beforeGhost = formData.content.substring(0, insertPosition);
    const afterGhost = formData.content.substring(insertPosition);
    const newContent = beforeGhost + '\n\n' + currentPrompt + afterGhost;
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
    
    // Set cursor after the ghost text
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = insertPosition + 2 + currentPrompt.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
    
    // Send analytics - immediate POST for ghost insertion
    analyticsService.logPromptInsert({
      promptText: currentPrompt,
      promptId: `prompt_${nextIndex}`,
      mode: 'ghost'
    }).catch(err => {
      console.error('Failed to log ghost prompt insertion:', err);
    });
  };

  // Remove ghost paragraph
  const removeGhostParagraph = () => {
    if (!ghostParagraphId || !ghostText) return;
    
    // Remove ghost text from content
    const updatedContent = formData.content.replace('\n\n' + ghostText, '');
    setFormData(prev => ({
      ...prev,
      content: updatedContent
    }));
    
    setGhostParagraphId(null);
    setGhostText('');
    setGhostPosition(null);
  };

  // Convert ghost to normal text
  const convertGhostToNormal = () => {
    // Ghost text is already in content, just clear the ghost state
    setGhostParagraphId(null);
    setGhostText('');
    setGhostPosition(null);
  };

  // Insert prompt as regular text on manual assist button click
  const assistPrompt = () => {
    if (shuffleList.length === 0 || !textareaRef.current) return;
    
    let nextIndex = promptIndex;
    
    // Check if we're at the end of the list - reshuffle if needed
    if (nextIndex >= shuffleList.length) {
      const newPrompts = getRandomPrompts(14);
      setShuffleList(newPrompts);
      nextIndex = 0;
      setPromptIndex(0);
    }
    
    let currentPrompt = shuffleList[nextIndex];
    
    // Ensure no consecutive duplicates
    if (lastInsertedPrompt.current === currentPrompt && shuffleList.length > 1) {
      nextIndex = (nextIndex + 1) % shuffleList.length;
      currentPrompt = shuffleList[nextIndex];
      
      // If still the same after increment, reshuffle
      if (lastInsertedPrompt.current === currentPrompt) {
        const newPrompts = getRandomPrompts(14);
        setShuffleList(newPrompts);
        nextIndex = 0;
        currentPrompt = newPrompts[0];
      }
    }
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    
    // Insert prompt at cursor position as regular text
    const beforeCursor = formData.content.substring(0, cursorPos);
    const afterCursor = formData.content.substring(cursorPos);
    const newContent = beforeCursor + '\n\n' + currentPrompt + afterCursor;
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
    
    // Track this prompt and move to next
    lastInsertedPrompt.current = currentPrompt;
    setPromptIndex(nextIndex + 1);
    
    // Set cursor after the inserted text
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = cursorPos + 2 + currentPrompt.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
    
    // Update last typed timestamp to reset inactivity timer
    setLastTypedAt(Date.now());
    setLastAction('typing');
    
    // Send analytics - immediate POST for assist button insertion
    analyticsService.logPromptInsert({
      promptText: currentPrompt,
      promptId: `prompt_${nextIndex}`,
      mode: 'assist'
    }).catch(err => {
      console.error('Failed to log assist prompt insertion:', err);
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Check if user is typing in ghost text area
    if (name === 'content' && ghostParagraphId && ghostText) {
      const prevContent = formData.content;
      
      // If content is being added (typing into ghost), convert ghost to normal
      if (value.length > prevContent.length) {
        const addedText = value.substring(prevContent.length);
        // Check if the edit happened within ghost text range
        if (prevContent.includes(ghostText)) {
          convertGhostToNormal();
        }
      }
      
      // If content is being removed, check if ghost text is being deleted
      if (value.length < prevContent.length) {
        // If ghost text is no longer in content, it was deleted
        if (prevContent.includes(ghostText) && !value.includes(ghostText)) {
          // Ghost was deleted, clear the state but don't advance prompt
          setGhostParagraphId(null);
          setGhostText('');
          setGhostPosition(null);
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Update last typed timestamp and action for stuck prompts
    if (name === 'content') {
      setLastTypedAt(Date.now());
      setLastAction('typing');
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle keypress in textarea to track typing activity
  const handleKeyPress = (e) => {
    setLastTypedAt(Date.now());
    setLastAction('typing');
    
    // Handle typing within ghost text (convert to normal)
    if (ghostParagraphId && ghostText && formData.content.includes(ghostText)) {
      // Check if cursor is within ghost text range
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const ghostStart = formData.content.indexOf(ghostText);
      const ghostEnd = ghostStart + ghostText.length;
      
      // If typing near or in ghost text, convert it
      if (cursorPos >= ghostStart - 2 && cursorPos <= ghostEnd + 2) {
        convertGhostToNormal();
      }
    }
  };



  const [showTitlePrompt, setShowTitlePrompt] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If content is written but no title, show title prompt
    if (formData.content.trim() && !showTitlePrompt && !formData.title.trim()) {
      setShowTitlePrompt(true);
      return;
    }
    
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
      title: formData.title.trim() || formData.content.substring(0, 50).trim() + '...'
    };

    // Submit the form data
    onSubmit(finalFormData);
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/,/g, '');
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
      
      // Show notification
      setNotification({ show: true, message: `Tag "${tag}" added!` });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };



  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit Entry' : 'Write New Entry'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content - Show First */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  // Start removal timer on blur
                  if (ghostParagraphId && ghostText) {
                    ghostRemovalTimer.current = setTimeout(() => {
                      removeGhostParagraph();
                    }, 3000);
                  }
                }}
                onFocus={() => {
                  // Clear removal timer on focus
                  if (ghostRemovalTimer.current) {
                    clearTimeout(ghostRemovalTimer.current);
                    ghostRemovalTimer.current = null;
                  }
                }}
                rows="12"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none transition-all duration-300 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Write your thoughts here... (Start writing, we'll ask for a title when you're done)"
                autoFocus
              />
              
              {/* Ghost text indicator */}
              {ghostParagraphId && ghostText && formData.content.includes(ghostText) && (
                <div 
                  className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full border border-purple-200 pointer-events-none flex items-center space-x-1 shadow-sm transition-opacity duration-300 opacity-100"
                  role="note"
                  aria-label="suggested prompt"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium">Prompt added</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-1">
              {errors.content && (
                <span className="text-sm text-red-600">{errors.content}</span>
              )}
              <div className="flex items-center space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={assistPrompt}
                  className="text-sm text-brand-primary hover:text-brand-secondary font-medium flex items-center space-x-1 transition-colors duration-200"
                  title="Get writing help"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Help</span>
                </button>
                <span className={`text-sm ${formData.content.length > 9000 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {formData.content.length}/10000
                </span>
              </div>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-300 ${
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



          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Type a tag and press Enter (max 10)"
                  disabled={formData.tags.length >= 10}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {formData.tags.length}/10 tags • Press Enter or comma to add
              </p>
            </div>
          </div>

          {/* Distraction-Free Mode Toggle */}
          <div className="flex items-center p-4 bg-brand-accent-1/30 rounded-lg border border-brand-primary/20">
            <input
              type="checkbox"
              id="distractionFree"
              checked={distractionFree}
              onChange={(e) => setDistractionFree(e.target.checked)}
              className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
            />
            <label htmlFor="distractionFree" className="ml-3 block text-sm text-gray-700">
              <span className="font-medium">Distraction-Free Mode</span>
              <p className="text-gray-500">Hide extra options and focus on writing</p>
            </label>
          </div>

          {/* Privacy Setting */}
          {!distractionFree && (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-3 block text-sm text-gray-700">
                <span className="font-medium">Make this entry public</span>
                <p className="text-gray-500">Other users will be able to read this entry</p>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.content.trim()}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform duration-300 font-medium flex items-center"
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
      {/* End Editor Card */}

      {/* Side Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-brand-primary text-white px-6 py-4 rounded-lg shadow-soft2 flex items-center space-x-3 border border-brand-secondary">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '' })}
              className="ml-2 text-white hover:text-white/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors duration-300"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;