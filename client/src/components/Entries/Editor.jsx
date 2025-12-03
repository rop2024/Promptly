import React, { useState, useEffect } from 'react';

const MOOD_OPTIONS = [
  { value: 'neutral', label: '😐 Neutral', color: 'gray' },
  { value: 'happy', label: '😊 Happy', color: 'yellow' },
  { value: 'sad', label: '😢 Sad', color: 'blue' },
  { value: 'excited', label: '🎉 Excited', color: 'orange' },
  { value: 'angry', label: '😠 Angry', color: 'red' },
  { value: 'peaceful', label: '☮️ Peaceful', color: 'green' },
  { value: 'anxious', label: '😰 Anxious', color: 'purple' },
  { value: 'grateful', label: '🙏 Grateful', color: 'teal' },
  { value: 'tired', label: '😴 Tired', color: 'indigo' },
  { value: 'motivated', label: '💪 Motivated', color: 'pink' }
];

const Editor = ({ entry, onSubmit, onCancel, isLoading = false, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    isPublic: false,
    newTag: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || 'neutral',
        tags: entry.tags || [],
        isPublic: entry.isPublic || false,
        newTag: ''
      });
    }
  }, [entry]);

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

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      if (formData.tags.length >= 10) {
        setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    const { newTag, ...submitData } = formData;
    onSubmit(submitData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Backspace' && !formData.newTag && formData.tags.length > 0) {
      // Remove last tag when backspace is pressed and tag input is empty
      handleRemoveTag(formData.tags[formData.tags.length - 1]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {mode === 'edit' ? 'Edit Entry' : 'Write New Entry'}
        </h2>

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

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {MOOD_OPTIONS.map(mood => (
                <label
                  key={mood.value}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.mood === mood.value
                      ? `border-${mood.color}-500 bg-${mood.color}-50 shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={mood.value}
                    checked={formData.mood === mood.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{mood.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="newTag" className="block text-sm font-medium text-gray-700 mb-2">
              Tags {formData.tags.length > 0 && `(${formData.tags.length}/10)`}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="newTag"
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                onKeyPress={handleKeyPress}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Add a tag... (Press Enter to add)"
                maxLength="20"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!formData.newTag.trim()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Add
              </button>
            </div>
            
            {errors.tags && (
              <span className="text-sm text-red-600 mt-1">{errors.tags}</span>
            )}
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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