import React from 'react';
import DailyPrompt from '../Prompts/DailyPrompt.jsx';

const DashboardStats = ({ entries, promptStats, onNewEntry }) => {
  const recentEntries = entries.slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Daily Prompt */}
      <div className="lg:col-span-1">
        <DailyPrompt compact={true} />
      </div>

      {/* Quick Stats */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
          <div className="text-gray-600 text-sm">Total Entries</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {promptStats?.streak || 0}
          </div>
          <div className="text-gray-600 text-sm">Prompt Streak</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {promptStats?.totalCompleted || 0}
          </div>
          <div className="text-gray-600 text-sm">Prompts Done</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">
            {recentEntries.length}
          </div>
          <div className="text-gray-600 text-sm">Recent</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;