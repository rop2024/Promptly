import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Clock } from 'lucide-react';

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

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    const cleanContent = content.trim();
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength).trim() + '...';
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const isRecentlyUpdated = () => {
    if (!entry.updatedAt) return false;
    const updated = new Date(entry.updatedAt);
    const created = new Date(entry.createdAt);
    return updated.getTime() - created.getTime() > 60000; // More than 1 minute difference
  };

  return (
    <article className="bg-white rounded-lg shadow-soft p-4 transition-transform duration-300 hover:shadow-soft2 hover:scale-105">
      <div>
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
                  <span className="text-xs bg-brand-accent-1 text-brand-primary px-2 py-1 rounded-full border border-brand-primary/20">
                    Public
                  </span>
                )}
                {isRecentlyUpdated() && (
                  <span className="text-xs bg-brand-accent-2/20 text-brand-secondary px-2 py-1 rounded-full border border-brand-secondary/20">
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
              className="p-2 text-gray-400 hover:text-brand-primary transition-all duration-300 rounded-lg hover:bg-brand-accent-1/50 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
              title="View entry"
              aria-label="View entry"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(entry)}
              className="p-2 text-gray-400 hover:text-brand-secondary transition-all duration-300 rounded-lg hover:bg-brand-accent-2/30 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
              title="Edit entry"
              aria-label="Edit entry"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-lg hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              title="Delete entry"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-600 text-sm leading-relaxed break-words line-clamp-3">
            {entry.content}
          </p>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent-1 text-brand-primary border border-brand-primary/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="whitespace-nowrap">{formatDate(entry.createdAt)}</span>
            {formatTime(entry.timeSpent) && (
              <span className="flex items-center text-brand-primary font-medium whitespace-nowrap">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(entry.timeSpent)}
              </span>
            )}
          </div>
          <Link
            to={`/entries/${entry.id}`}
            className="text-brand-primary hover:underline font-medium whitespace-nowrap transition-colors duration-300"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EntryCard;