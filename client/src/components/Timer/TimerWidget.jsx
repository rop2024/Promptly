import React, { useState, useEffect } from 'react';

const TimerWidget = ({ initialTime = 0, isActive: externalIsActive = false, onToggle = null, showControls = true }) => {
  const [timeSpent, setTimeSpent] = useState(initialTime);
  const [isActive, setIsActive] = useState(externalIsActive);

  useEffect(() => {
    setTimeSpent(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (externalIsActive !== undefined) {
      setIsActive(externalIsActive);
    }
  }, [externalIsActive]);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (!isActive && timeSpent !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (onToggle) {
      onToggle(newState, timeSpent);
    }
  };

  return (
    <div className="group relative">
      <div className="bg-gradient-to-r from-brand-accent-1 to-brand-accent-2/30 px-5 py-3 rounded-lg border border-brand-primary/20 hover:border-brand-primary transition-all duration-300 cursor-pointer shadow-soft">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${
            isActive ? 'bg-brand-primary/20' : 'bg-gray-100'
          }`}>
            <svg className={`w-6 h-6 transition-colors duration-300 ${
              isActive ? 'text-brand-primary animate-pulse' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">Writing Time</div>
            <div className="text-2xl font-bold text-gray-800 tabular-nums">{formatTime(timeSpent)}</div>
          </div>
        </div>
      </div>
      
      {/* Hover Controls */}
      {showControls && (
        <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
          <div className="bg-white rounded-lg shadow-soft2 border border-gray-200 p-2 flex space-x-2">
            <button
              type="button"
              onClick={handleToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:scale-105'
                  : 'bg-brand-accent-1 text-brand-primary hover:bg-brand-accent-2/20 hover:scale-105'
              }`}
            >
              {isActive ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Resume</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTimeSpent(0)}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              title="Reset timer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerWidget;
