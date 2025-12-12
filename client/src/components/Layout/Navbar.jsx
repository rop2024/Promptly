import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, BarChart2, LogOut, Menu, X, Plus, User, Settings } from 'lucide-react';
import authService from '../../services/authService.js';
import entryService from '../../services/entryService.js';

const Navbar = ({ currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadUserStats();
    }
  }, [currentUser]);

  const loadUserStats = async () => {
    try {
      const response = await entryService.getStats();
      setUserStats(response.data?.data || null);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => `
    flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none
    ${isActive 
      ? 'bg-brand-primary/10 ring-1 ring-brand-primary text-gray-900' 
      : 'text-gray-700 hover:bg-gray-50'
    }
  `;

  return (
    <nav className="sticky top-0 z-50">
      <div className="glass flex items-center justify-between px-6 py-4">
        {/* Logo and brand */}
        <NavLink to="/" className="flex items-center space-x-2 p-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Promptly</span>
        </NavLink>

        {/* Navigation links - desktop */}
        {currentUser && (
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass}>
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/entries" className={navLinkClass}>
              <BookOpen className="w-5 h-5" />
              <span>Entries</span>
            </NavLink>
          </div>
        )}

        {/* Actions and User menu */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <>
              {/* New Entry Button - Desktop */}
              <NavLink
                to="/entries/new"
                className="hidden md:flex items-center space-x-2 bg-brand-primary text-white px-4 py-3 rounded-lg hover:bg-brand-secondary transition-all duration-300 text-sm font-medium shadow-soft focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Plus className="w-5 h-5" />
                <span>New Entry</span>
              </NavLink>

              {/* User Dropdown - Desktop */}
              <div 
                className="hidden md:block relative"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <button
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
                  aria-label="User menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center ring-2 ring-brand-primary/30">
                    <span className="text-brand-primary font-semibold text-sm">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-green-600 via-brand-primary to-brand-secondary p-4 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/50">
                          <span className="text-white font-bold text-lg">
                            {currentUser.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{currentUser.name}</div>
                          <div className="text-xs text-green-100">{currentUser.email}</div>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      {userStats && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold">{userStats.totalEntries || 0}</div>
                            <div className="text-xs text-green-100">Entries</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{userStats.currentStreak || 0}</div>
                            <div className="text-xs text-green-100">Day Streak</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <NavLink
                        to="/stats"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm text-gray-700"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <BarChart2 className="w-4 h-4" />
                        <span>Stats</span>
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm text-gray-700"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm text-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <NavLink
                to="/login"
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-3 rounded-lg hover:bg-brand-secondary transition-all duration-300 text-sm font-medium shadow-soft"
              >
                <span>Sign up</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && currentUser && (
        <div className="md:hidden glass border-t border-white/20 mt-1">
          <div className="flex flex-col space-y-2 px-4 py-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-2">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center ring-2 ring-brand-primary/30">
                <span className="text-brand-primary font-semibold">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-600">{currentUser.email}</div>
              </div>
            </div>

            {/* Navigation Links */}
            <NavLink
              to="/"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/entries"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="w-5 h-5" />
              <span>Entries</span>
            </NavLink>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Stats Link */}
            <NavLink
              to="/stats"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Stats</span>
            </NavLink>

            {/* Settings Link */}
            <NavLink
              to="/settings"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* New Entry Button */}
            <NavLink
              to="/entries/new"
              className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-3 rounded-lg hover:bg-brand-secondary transition-all duration-300 text-sm font-medium shadow-soft justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span>New Entry</span>
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;