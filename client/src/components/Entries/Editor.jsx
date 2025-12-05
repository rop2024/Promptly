import React, { useState, useEffect } from 'react';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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



  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Stop timer
    setIsActive(false);
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    if (formData.content.length > 10000) newErrors.content = 'Content must be 10000 characters or less';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Include time spent in submission
    onSubmit({ ...formData, timeSpent });
  };



  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit Entry' : 'Write New Entry'}
          </h2>
          
          {/* Time Recorder */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <svg className={`w-5 h-5 ${isActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-600">Time Spent</div>
                  <div className="text-lg font-bold text-gray-800">{formatTime(timeSpent)}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                isActive 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isActive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
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
              placeholder="What's on your mind today?"
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

          {/* Content */}
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
              placeholder="Write your thoughts here..."
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
              disabled={isLoading}
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
              ) : (
                mode === 'edit' ? 'Update Entry' : 'Create Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Editor;