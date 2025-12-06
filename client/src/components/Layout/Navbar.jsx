import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Settings, LogOut, Menu, X, Plus } from 'lucide-react';
import authService from '../../services/authService.js';

const Navbar = ({ currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-5 h-5" />
              <span>Settings</span>
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

              {/* User Info - Desktop */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2">
                <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center ring-2 ring-brand-primary/30">
                  <span className="text-brand-primary font-semibold text-sm">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              </div>

              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>

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
            <NavLink
              to="/settings"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>

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