import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWalls } from '../hooks/useWalls';
import { Plus, ExternalLink, Settings, MessageCircle, BarChart3, Eye, Archive } from 'lucide-react';
import CreateWallForm from './walls/CreateWallForm';
import WallStats from './walls/WallStats';

const Dashboard = () => {
  const { user } = useAuth();
  const { walls, loading, error } = useWalls();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWall, setSelectedWall] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  const handleCreateWallSuccess = () => {
    setShowCreateForm(false);
  };

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
                Manage your feedback walls and view responses
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Wall
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Walls</p>
                <p className="text-3xl font-bold text-gray-900">{walls?.length || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900">
                  {walls?.reduce((acc, wall) => acc + (wall.feedbackCount || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {walls?.length > 0 ? 
                    Math.round((walls.filter(w => w.hasResponses).length / walls.length) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Walls Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Your Walls</h2>
            <p className="text-gray-600 mt-1">Manage and view analytics for your feedback walls</p>
          </div>

          {walls?.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No walls created yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first feedback wall to start collecting anonymous feedback
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Create Your First Wall
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {walls.map((wall) => (
                <div key={wall._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        spillr.com/{wall.slug}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {new Date(wall.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          {wall.feedbackCount || 0} feedback received
                        </span>
                        <span className="text-sm text-gray-600">
                          {wall.answeredCount || 0} answered
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <a
                        href={`/wall/${wall.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View public wall"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      
                      <a
                        href={`/dashboard/wall/${wall._id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Manage feedback"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                      
                      <a
                        href={`/dashboard/wall/${wall._id}/settings`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Wall settings"
                      >
                        <Settings className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Wall Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Wall</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              >
                ×
              </button>
            </div>
            <CreateWallForm
              onSuccess={handleCreateWallSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;