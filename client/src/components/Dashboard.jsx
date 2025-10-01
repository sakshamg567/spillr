import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, BarChart3, Eye, ExternalLink, Settings, Copy, CheckCircle } from 'lucide-react';
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${user?.username}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const feedbackLink = `${window.location.origin}/${user?.username}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your anonymous feedback
              </p>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Share Your Link */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-2">
              Share Your Feedback Link
            </h2>
            <p className="mb-6 opacity-90">
              Anyone with this link can send you anonymous feedback
            </p>
            
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-lg px-4 py-3 text-gray-900 font-medium flex items-center justify-between">
                <span>{feedbackLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
              <a
                href={`/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Preview
              </a>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.pending || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Answered</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.answered || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.responseRate || 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/feedback"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manage Feedback
                </h3>
                <p className="text-gray-600 mb-4">
                  View and respond to feedback from your audience
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  View All Feedback →
                </div>
              </div>
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
          </a>

          <a
            href="/settings"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Customize Page
                </h3>
                <p className="text-gray-600 mb-4">
                  Change theme, colors, and page settings
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  Go to Settings →
                </div>
              </div>
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </a>
        </div>

        {/* Recent Activity */}
        {stats?.recentFeedback && stats.recentFeedback.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Feedback
              </h2>
            </div>
            <div className="divide-y">
              {stats.recentFeedback.map((feedback) => (
                <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{feedback.question}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        {feedback.isAnswered ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Answered
                          </span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/feedback/${feedback._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <a
                href="/feedback"
                className="text-center block text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Feedback →
              </a>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!stats?.recentFeedback || stats.recentFeedback.length === 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No feedback yet
            </h3>
            <p className="text-gray-600 mb-6">
              Share your link to start receiving anonymous feedback
            </p>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <Copy className="w-5 h-5" />
              Copy Your Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;