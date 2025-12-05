import React from 'react';
import { Link } from 'react-router-dom';

const EntryCard = ({ entry, onEdit, onDelete, onView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const isRecentlyUpdated = () => {
    if (!entry.updatedAt) return false;
    const updated = new Date(entry.updatedAt);
    const created = new Date(entry.createdAt);
    return updated.getTime() - created.getTime() > 60000; // More than 1 minute difference
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">📝</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {entry.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {entry.isPublic && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Public
                  </span>
                )}
                {isRecentlyUpdated() && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Updated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-1 ml-3 flex-shrink-0">
            <button
              onClick={() => onView(entry)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200 rounded-lg hover:bg-blue-50"
              title="View entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(entry)}
              className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200 rounded-lg hover:bg-green-50"
              title="Edit entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50"
              title="Delete entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {truncateContent(entry.content)}
          </p>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
          <div className="flex items-center space-x-4">
            <span>Created: {formatDate(entry.createdAt)}</span>
            {isRecentlyUpdated() && (
              <span>Updated: {formatDate(entry.updatedAt)}</span>
            )}
          </div>
          <Link
            to={`/entries/${entry.id}`}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;