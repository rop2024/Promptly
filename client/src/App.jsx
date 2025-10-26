import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from './services/authService.js';
import entryService from './services/entryService.js';
import promptService from './services/promptService.js';
import EntryForm from './components/Journal/EntryForm.jsx';
import EntryList from './components/Journal/EntryList.jsx';
import DailyPrompt from './components/Prompts/DailyPrompt.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  // Connection status message
  const [connectionMessage, setConnectionMessage] = useState('');

  // Auth-related state
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLogin, setIsLogin] = useState(true);

  // Users + add-user form (original app)
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Journal states
  const [entries, setEntries] = useState([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', mood: '', tag: '' });

  // Prompt states
  const [promptStats, setPromptStats] = useState(null);
  const [showPromptSection, setShowPromptSection] = useState(true);

  // On mount: check auth, test API connection, load users
  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (user) {
      setCurrentUser(user);
      // load journal data for authenticated user
      loadEntries();
      loadStats();
      loadPromptStats();
    }

    const testConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/test`);
        setConnectionMessage(response.data.message || 'Connected');
      } catch (error) {
        setConnectionMessage('Failed to connect to server');
        console.error('API connection error:', error);
      }
    };

    testConnection();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload entries when filters change or when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentUser]);

  // Load users from API
  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Journal data functions
  const loadEntries = async () => {
    try {
      setLoading(true);
      const result = await entryService.getEntries(filters);
      // entryService returns full axios response
      setEntries(result.data);
    } catch (error) {
      setMessage('Failed to load entries');
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await entryService.getStats();
      setStats(result.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Prompt functions
  const loadPromptStats = async () => {
    try {
      const result = await promptService.getPromptStats();
      setPromptStats(result.data);
    } catch (error) {
      console.error('Error loading prompt stats:', error);
    }
  };

  const handlePromptCompleted = async (response) => {
    // Create a journal entry from the prompt response
    if (response.trim()) {
      try {
        await entryService.createEntry({
          title: 'Daily Prompt Response',
          content: response,
          mood: 'neutral',
          tags: ['daily-prompt']
        });
        setMessage('Prompt completed and entry saved!');
        loadEntries(); // Refresh entries list
      } catch (error) {
        console.error('Error creating entry from prompt:', error);
      }
    }
    loadPromptStats(); // Refresh prompt stats
  };

  // Add a new user (public endpoint in original app)
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users`, { name, email });
      setName('');
      setEmail('');
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateEntry = async (entryData) => {
    try {
      setLoading(true);
      await entryService.createEntry(entryData);
      setMessage('Entry created successfully!');
      setShowEntryForm(false);
      loadEntries();
      loadStats();
    } catch (error) {
      setMessage('Failed to create entry');
      console.error('Error creating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntry = async (entryData) => {
    try {
      setLoading(true);
      await entryService.updateEntry(editingEntry.id, entryData);
      setMessage('Entry updated successfully!');
      setEditingEntry(null);
      loadEntries();
      loadStats();
    } catch (error) {
      setMessage('Failed to update entry');
      console.error('Error updating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await entryService.deleteEntry(entry.id);
        setMessage('Entry deleted successfully!');
        loadEntries();
        loadStats();
      } catch (error) {
        setMessage('Failed to delete entry');
        console.error('Error deleting entry:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Auth handlers (from provided auth code)
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage('');

    try {
      if (isLogin) {
        const result = await authService.login({ email: authForm.email, password: authForm.password });
        setCurrentUser(result.user);
        setAuthMessage('Login successful!');
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthMessage('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await authService.register({ name: authForm.name, email: authForm.email, password: authForm.password });
        setCurrentUser(result.user);
        setAuthMessage('Registration successful!');
      }

      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setAuthMessage(
        error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout?.();
    setCurrentUser(null);
    setAuthMessage('Logged out successfully');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthMessage('');
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          MERN App — Auth & Users
        </h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
          <p className={`text-lg ${connectionMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
            {connectionMessage}
          </p>
        </div>

        {/* Auth Section */}
        <div className="mb-8">
          {!currentUser ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4 text-center">{isLogin ? 'Login' : 'Register'}</h2>

              {authMessage && (
                <div className={`mb-4 p-3 rounded ${authMessage.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {authMessage}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={authForm.name}
                      onChange={handleAuthChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={authForm.confirmPassword}
                      onChange={handleAuthChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      required={!isLogin}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={toggleAuthMode} className="text-blue-500 hover:text-blue-700">
                  {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
              </div>
            </div>
          ) : (
            // Journal Interface
            <div>
              {/* Daily Prompt Section */}
              {currentUser && showPromptSection && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Daily Prompt</h2>
                    <button
                      onClick={() => setShowPromptSection(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <DailyPrompt 
                    onPromptCompleted={handlePromptCompleted}
                    compact={false}
                  />
                  
                  {/* Prompt Stats */}
                  {promptStats && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">{promptStats.streak}</div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-green-600">{promptStats.totalCompleted}</div>
                        <div className="text-sm text-gray-600">Total Completed</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow">
                        <div className="text-2xl font-bold text-purple-600">
                          {promptStats.completedToday ? '✅' : '❌'}
                        </div>
                        <div className="text-sm text-gray-600">Today</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Top bar with welcome and actions */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Welcome, {currentUser.name}!</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowEntryForm(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      New Entry
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {message && (
                  <div className={`mt-4 p-3 rounded ${message.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </div>
                )}
              </div>

              {/* Journal content */}
              <div className="px-4 py-6 sm:px-0">
                {/* Stats Overview */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                      <div className="text-gray-500">Total Entries</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-green-600">{(stats?.moodStats?.[0]?.count) || 0}</div>
                      <div className="text-gray-500">{stats?.moodStats?.[0]?._id || 'No'} Mood</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-purple-600">{stats?.recentActivity?.length || 0}</div>
                      <div className="text-gray-500">Recent Activity</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-orange-600">{(stats?.monthlyStats || []).reduce((sum, month) => sum + (month.count || 0), 0)}</div>
                      <div className="text-gray-500">Last 6 Months</div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange({ search: e.target.value })}
                      className="p-2 border rounded"
                    />
                    <select
                      value={filters.mood}
                      onChange={(e) => handleFilterChange({ mood: e.target.value })}
                      className="p-2 border rounded"
                    >
                      <option value="">All Moods</option>
                      <option value="happy">😊 Happy</option>
                      <option value="sad">😢 Sad</option>
                      <option value="excited">🎉 Excited</option>
                      <option value="peaceful">☮️ Peaceful</option>
                      <option value="neutral">😐 Neutral</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Filter by tag..."
                      value={filters.tag}
                      onChange={(e) => handleFilterChange({ tag: e.target.value })}
                      className="p-2 border rounded"
                    />
                    <button
                      onClick={() => handleFilterChange({ search: '', mood: '', tag: '' })}
                      className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Entry Form Modal */}
                {(showEntryForm || editingEntry) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <EntryForm
                        entry={editingEntry}
                        onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
                        onCancel={() => { setShowEntryForm(false); setEditingEntry(null); }}
                        isLoading={loading}
                      />
                    </div>
                  </div>
                )}

                {/* View Entry Modal */}
                {viewingEntry && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-2xl font-bold">{viewingEntry.title}</h2>
                          <button onClick={() => setViewingEntry(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="prose max-w-none mb-4">
                          <pre className="whitespace-pre-wrap font-sans">{viewingEntry.content}</pre>
                        </div>
                        <div className="border-t pt-4">
                          <button onClick={() => { setEditingEntry(viewingEntry); setViewingEntry(null); }} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Edit</button>
                          <button onClick={() => setViewingEntry(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entries List */}
                <EntryList
                  entries={entries.data || entries}
                  onEdit={setEditingEntry}
                  onDelete={handleDeleteEntry}
                  onView={setViewingEntry}
                  isLoading={loading}
                />

                {/* Pagination */}
                {entries.pagination && entries.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button onClick={() => handleFilterChange({ page: filters.page - 1 })} disabled={!entries.pagination.hasPrevPage} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
                    <span className="px-4 py-2">Page {entries.pagination.page} of {entries.pagination.totalPages}</span>
                    <button onClick={() => handleFilterChange({ page: filters.page + 1 })} disabled={!entries.pagination.hasNextPage} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add User Form (available regardless of auth) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Add User
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found. Add some users above!</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id || user.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-600">{user.email}</p>
                  {user.createdAt && (
                    <p className="text-sm text-gray-400">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;