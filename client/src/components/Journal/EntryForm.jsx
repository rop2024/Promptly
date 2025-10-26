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

const EntryForm = ({ entry, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    isPublic: false,
    newTag: ''
  });

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
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
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
    const { newTag, ...submitData } = formData;
    onSubmit(submitData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          placeholder="What's on your mind today?"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="8"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          placeholder="Write your thoughts here..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.content.length}/10000 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MOOD_OPTIONS.map(mood => (
            <label
              key={mood.value}
              className={`flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.mood === mood.value
                  ? `border-${mood.color}-500 bg-${mood.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
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
              <span className="text-sm">{mood.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="newTag" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="newTag"
            value={formData.newTag}
            onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="Add a tag..."
            maxLength="20"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!formData.newTag.trim()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
          Make this entry public (visible to others)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;