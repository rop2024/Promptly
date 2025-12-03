import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService.js';

// Layout
import Layout from './components/Layout/Layout.jsx';

// Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Home/Dashboard.jsx';
import EntriesPage from './pages/Entries/EntriesPage.jsx';
import EntryDetail from './pages/Entries/EntryDetail.jsx';
import EntryEdit from './pages/Entries/EntryEdit.jsx';
import EntryNew from './pages/Entries/EntryNew.jsx';
import Settings from './pages/Settings/Settings.jsx';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for logged in user on app start
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading JournalApp...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              currentUser ? <Navigate to="/" replace /> : <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              currentUser ? <Navigate to="/" replace /> : <Register />
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <Dashboard currentUser={currentUser} />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/entries" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <EntriesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/entries/new" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <EntryNew />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/entries/:id" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <EntryDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/entries/:id/edit" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <EntryEdit />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout currentUser={currentUser} onLogout={handleLogout}>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;