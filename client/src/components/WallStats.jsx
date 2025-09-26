import React from 'react';
import { BarChart3, MessageCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const WallStats = ({ stats, className = '' }) => {
  const {
    total = 0,
    answered = 0,
    active = 0,
    archived = 0,
    answerRate = 0,
    topReactions = []
  } = stats || {};

  const statCards = [
    {
      label: 'Total Feedback',
      value: total,
      icon: MessageCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Active',
      value: active,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Answered',
      value: answered,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Response Rate',
      value: `${answerRate}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Reactions */}
      {topReactions && topReactions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Top Reactions</h3>
          </div>
          
          <div className="space-y-3">
            {topReactions.slice(0, 5).map((reaction, index) => (
              <div key={reaction.emoji} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{reaction.emoji}</span>
                  <span className="text-sm text-gray-600">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(10, (reaction.count / topReactions[0].count) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {reaction.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-900 mb-4">Activity Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Feedback</span>
              <span className="font-medium">{active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Answered</span>
              <span className="font-medium">{answered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Archived</span>
              <span className="font-medium">{archived}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{total > 0 ? Math.round(((answered + archived) / total) * 100) : 0}% processed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${total > 0 ? Math.round(((answered + archived) / total) * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Avg. Daily Feedback</span>
              <span className="text-lg font-bold text-gray-900">
                {total > 0 ? Math.round(total / 7) : 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Response Rate</span>
              <span className={`text-lg font-bold ${
                answerRate >= 80 ? 'text-green-600' : 
                answerRate >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {answerRate}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Engagement Score</span>
              <span className="text-lg font-bold text-blue-600">
                {topReactions.reduce((acc, r) => acc + r.count, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallStats;