import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import Editor from '../../components/Entries/Editor.jsx';

const EntryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const result = await entryService.getEntry(id);
      setEntry(result.data);
    } catch (error) {
      console.error('Error loading entry:', error);
      if (error.response?.status === 404) {
        navigate('/entries', { replace: true });
      } else {
        setMessage('Failed to load entry');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setMessage('');
      
      await entryService.updateEntry(id, formData);
      
      setMessage('Entry updated successfully!');
      
      // Redirect to entry detail page after a short delay
      setTimeout(() => {
        navigate(`/entries/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating entry:', error);
      setMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to update entry. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      navigate(`/entries/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Editor Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            
            <div className="flex justify-end pt-8">
              <div className="h-10 bg-gray-200 rounded w-24 mr-4"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto">
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
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Entry Not Found</h2>
          <p className="text-gray-600 mb-6">The journal entry you're trying to edit doesn't exist or has been deleted.</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/entries"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
            >
              Back to Entries
            </Link>
            <Link
              to="/entries/new"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            >
              Create New Entry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to={`/entries/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Entry
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
              Redirecting to entry...
            </div>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Entry</h1>
          <p className="text-gray-600 mt-1">Update your journal entry</p>
        </div>
        
        <div className="text-sm text-gray-500">
          Last edited: {new Date(entry.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Editor Component */}
      <Editor
        entry={entry}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saving}
        mode="edit"
      />

      {/* Additional Actions */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EntryEdit;