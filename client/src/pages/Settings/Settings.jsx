import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService.js';
import promptService from '../../services/promptService.js';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Prompt Preferences
  const [preferences, setPreferences] = useState({
    promptCategories: [
      'reflection',
      'gratitude', 
      'creativity',
      'goals',
      'mindfulness'
    ],
    promptTime: 'morning',
    notifications: {
      dailyReminder: true,
      weeklySummary: true,
      streakReminders: true
    }
  });

  // Account Deletion
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const CATEGORIES = [
    { id: 'reflection', label: '🤔 Reflection', description: 'Thoughts about yourself and growth' },
    { id: 'gratitude', label: '🙏 Gratitude', description: 'Appreciation and thankfulness' },
    { id: 'creativity', label: '🎨 Creativity', description: 'Ideas, imagination, and inspiration' },
    { id: 'goals', label: '🎯 Goals', description: 'Plans, ambitions, and progress' },
    { id: 'mindfulness', label: '🧘 Mindfulness', description: 'Present moment awareness' },
    { id: 'relationships', label: '👥 Relationships', description: 'Connections with others' },
    { id: 'growth', label: '🌱 Growth', description: 'Learning and development' }
  ];

  const PROMPT_TIMES = [
    { id: 'morning', label: '🌅 Morning', description: 'Start your day with reflection' },
    { id: 'afternoon', label: '☀️ Afternoon', description: 'Midday check-in' },
    { id: 'evening', label: '🌙 Evening', description: 'End your day with reflection' },
    { id: 'anytime', label: '🕒 Anytime', description: 'No specific time preference' }
  ];

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  };

  const loadStats = async () => {
    try {
      const result = await promptService.getPromptStats();
      setStats(result.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authService.updateDetails({
        name: profileForm.name,
        email: profileForm.email,
        bio: profileForm.bio
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local storage with response data
      if (response?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        const user = authService.getCurrentUser();
        user.name = profileForm.name;
        user.email = profileForm.email;
        user.bio = profileForm.bio;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Force a refresh of user data in parent components
      window.dispatchEvent(new Event('userUpdated'));

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await promptService.updatePreferences({
        promptCategories: preferences.promptCategories,
        promptTime: preferences.promptTime
      });

      setMessage({ type: 'success', text: 'Preferences updated successfully!' });

    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update preferences' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setPreferences(prev => {
      const newCategories = prev.promptCategories.includes(categoryId)
        ? prev.promptCategories.filter(c => c !== categoryId)
        : [...prev.promptCategories, categoryId];
      
      return {
        ...prev,
        promptCategories: newCategories
      };
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }

    setLoading(true);
    try {
      // This would be an API call to delete account
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      authService.logout();
      navigate('/login');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      // This would be an API call to export data
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = authService.getCurrentUser();
      const exportData = {
        user: {
          name: user.name,
          email: user.email,
          stats: stats
        },
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `promptly-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and security preferences</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.73-.833-2.502 0L4.23 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: '👤 Profile', icon: 'user' },
                { id: 'password', label: '🔒 Password', icon: 'lock' },
                { id: 'preferences', label: '⚙️ Preferences', icon: 'settings' },
                { id: 'data', label: '💾 Data', icon: 'database' },
                { id: 'account', label: '⚠️ Account', icon: 'alert-triangle' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{tab.label.split(' ')[0]}</span>
                    <span className="font-medium">{tab.label.split(' ').slice(1).join(' ')}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Stats Summary */}
            {stats && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Your Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-semibold text-orange-600">{stats.streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Prompts</span>
                    <span className="font-semibold text-green-600">{stats.totalCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="text-sm text-gray-500">
                      {stats.lastCompletion ? new Date(stats.lastCompletion).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {profileForm.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-800">👤 Profile Information</h2>
                  <p className="text-gray-600">Manage your personal details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={profileForm.timezone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Tell us a little about yourself..."
                    maxLength="500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {profileForm.bio.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">🔐 Security & Password</h2>
                <p className="text-gray-600">Keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Enter new password"
                    />
                    <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Password Requirements</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Minimum 6 characters
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Use a mix of letters and numbers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Avoid common words and patterns
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 font-medium"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Writing Preferences</h2>
                <p className="text-gray-600">Customize your writing experience</p>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="space-y-8">
                {/* Prompt Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Prompt Categories</h3>
                  <p className="text-gray-600 mb-4">Select which types of prompts you'd like to receive:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CATEGORIES.map(category => (
                      <label
                        key={category.id}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          preferences.promptCategories.includes(category.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.promptCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{category.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Prompt Time */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferred Prompt Time</h3>
                  <p className="text-gray-600 mb-4">When do you prefer to write?</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROMPT_TIMES.map(time => (
                      <label
                        key={time.id}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          preferences.promptTime === time.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="promptTime"
                          checked={preferences.promptTime === time.id}
                          onChange={() => setPreferences(prev => ({ ...prev, promptTime: time.id }))}
                          className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{time.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{time.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'dailyReminder', label: 'Daily Reminder', description: 'Remind me to write every day' },
                      { id: 'weeklySummary', label: 'Weekly Summary', description: 'Send weekly writing statistics' },
                      { id: 'streakReminders', label: 'Streak Reminders', description: 'Notify me about my writing streak' }
                    ].map(notification => (
                      <label key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
                        <div>
                          <div className="font-medium text-gray-800">{notification.label}</div>
                          <div className="text-sm text-gray-600">{notification.description}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.notifications[notification.id]}
                          onChange={() => setPreferences(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [notification.id]: !prev.notifications[notification.id]
                            }
                          }))}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading || preferences.promptCategories.length === 0}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Data Management</h2>
                <p className="text-gray-600">Manage your data</p>
              </div>

              <div className="space-y-6">
                {/* Export Data */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Your Data</h3>
                      <p className="text-gray-600 mb-4">
                        Download all your entries, prompts, and statistics in JSON format.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1 mb-4">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          All entries with metadata
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Prompt history and statistics
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Streak and writing habit data
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={loading}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition duration-200 font-medium whitespace-nowrap"
                    >
                      {loading ? 'Exporting...' : 'Export Data'}
                    </button>
                  </div>
                </div>

                {/* Data Statistics */}
                {stats && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Data Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</div>
                        <div className="text-sm text-gray-600">Prompts Completed</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.lastCompletion ? 'Active' : 'Inactive'}
                        </div>
                        <div className="text-sm text-gray-600">Account Status</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.lastCompletion ? new Date(stats.lastCompletion).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm text-gray-600">Last Activity</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Privacy Information</h3>
                  <p className="text-blue-700">
                    Your entries are private by default. Only entries marked as "public" are visible to others.
                    We use encryption to protect your data and never share it with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Account Management</h2>
                <p className="text-gray-600">Manage your account settings</p>
              </div>

              <div className="space-y-8">
                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                  <p className="text-red-700 mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>

                  <div className="space-y-4">
                    {/* Delete Account */}
                    <div className="border border-red-300 rounded-lg p-4 bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-red-800 mb-1">Delete Account</h4>
                          <p className="text-red-600 text-sm">
                            Permanently delete your account and all associated data. This cannot be undone.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 font-medium whitespace-nowrap"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>

                    {/* Clear All Data */}
                    <div className="border border-orange-300 rounded-lg p-4 bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-1">Clear All Data</h4>
                          <p className="text-orange-600 text-sm">
                            Remove all entries while keeping your account active.
                          </p>
                        </div>
                        <button
                          onClick={() => alert('This feature would clear all your data. Not implemented in demo.')}
                          className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-medium whitespace-nowrap"
                        >
                          Clear Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Session</span>
                      <span className="font-medium text-gray-800">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Login</span>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Created</span>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString()} {/* This would be actual creation date */}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Your Account</h3>
              <p className="text-gray-500 mb-4">
                This will permanently delete your account and all your data. This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                  placeholder="Type DELETE here"
                />
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirm !== 'DELETE'}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition duration-200"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;