import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import entryService from '../../services/entryService.js';
import EntryCard from '../../components/Entries/EntryCard.jsx';

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    tag: ''
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const result = await entryService.getEntries(filters);
      setEntries(result.data?.data || []);
      setPagination(result.data?.pagination || null);
    } catch (error) {
      console.error('Error loading entries:', error);
      setEntries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleEntryDelete = async (entry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await entryService.deleteEntry(entry.id);
        setEntries(prev => prev.filter(e => e.id !== entry.id));
        loadEntries(); // Refresh to update pagination
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Entries</h1>
          <p className="text-gray-600 mt-1">Your personal thoughts and reflections</p>
        </div>
        <Link
          to="/entries/new"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium shadow-lg"
        >
          + New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search entries..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filters.tag}
              onChange={(e) => handleFilterChange({ tag: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <button
              onClick={() => handleFilterChange({ search: '', tag: '' })}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries found</h3>
          <p className="text-gray-500 mb-6">
            {filters.search || filters.tag 
              ? "Try adjusting your filters to see more entries."
              : "Start writing your first entry!"
            }
          </p>
          <Link
            to="/entries/new"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
          >
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {entries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => window.location.href = `/entries/${entry.id}/edit`}
                onDelete={handleEntryDelete}
                onView={() => window.location.href = `/entries/${entry.id}`}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EntriesPage;