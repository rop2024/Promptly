import React from 'react';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  angry: '😠',
  peaceful: '☮️',
  anxious: '😰',
  grateful: '🙏',
  tired: '😴',
  motivated: '💪',
  neutral: '😐'
};

const EntryList = ({ 
  entries, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries yet</h3>
        <p className="text-gray-500">Start writing your first journal entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map(entry => (
        <div key={entry.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                {entry.isPublic && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Public
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(entry)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="View entry"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(entry)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Edit entry"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(entry)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete entry"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4 whitespace-pre-line">
              {truncateContent(entry.content)}
            </p>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {entry.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
              <span>Created: {formatDate(entry.createdAt)}</span>
              {entry.updatedAt !== entry.createdAt && (
                <span>Updated: {formatDate(entry.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryList;