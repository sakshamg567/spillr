import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOwnerFeedback, useFeedbackAnswer } from '../hooks/useFeedback';
import { useWall } from '../hooks/useWalls';
import { 
  ArrowLeft,
  MessageCircle, 
  Reply, 
  Archive, 
  MoreHorizontal,
  Filter,
  Search,
  Settings,
  ExternalLink,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const OwnerWallView = () => {
  const { wallId } = useParams();
  const navigate = useNavigate();
  const { wall } = useWall(wallId);
  
  const {
    feedbacks,
    pagination,
    filters,
    loading,
    stats,
    updateFilters,
    changePage,
    answerFeedback,
    archiveFeedback
  } = useOwnerFeedback(wallId);

  const {
    formData: answerData,
    errors: answerErrors,
    loading: answerLoading,
    handleChange: handleAnswerChange,
    handleSubmit: handleAnswerSubmit,
    resetForm: resetAnswerForm
  } = useFeedbackAnswer();

  const [activeTab, setActiveTab] = useState('active');
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleReply = (feedbackId) => {
    setReplyingTo(feedbackId);
    resetAnswerForm();
  };

  const handleSubmitReply = async (feedbackId) => {
    try {
      await handleAnswerSubmit(feedbackId, () => {
        setReplyingTo(null);
      });
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleArchive = async (feedbackId) => {
    try {
      await archiveFeedback(feedbackId);
    } catch (error) {
      console.error('Failed to archive feedback:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateFilters({ sort: tab, page: 1 });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    updateFilters({ search: term, page: 1 });
  };

  if (loading && !feedbacks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  const wallUrl = wall ? `${window.location.origin}/wall/${wall.slug}` : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Feedback
                </h1>
                <p className="text-gray-600 mt-1">
                  Wall: {wall?.slug}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={wallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Wall
              </a>
              <button
                onClick={() => navigate(`/wall/${wallId}/settings`)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {/* (same as you had, keeping for brevity) */}

        {/* Filters and Search */}
        {/* (same as you had) */}

        {/* Feedback List */}
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            /* Empty state (same as you had) */
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'No pending feedback' : 
                 activeTab === 'answered' ? 'No answered feedback' : 'No archived feedback'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' ? 
                  'New feedback will appear here when people submit it.' :
                  'Feedback you\'ve responded to will appear here.'
                }
              </p>
              {activeTab === 'active' && (
                <a
                  href={wallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Share Your Wall
                </a>
              )}
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Feedback Question */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">Anonymous feedback</span>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {feedback.isAnswered && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Answered
                            </span>
                          )}
                          {feedback.isArchived && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              <Archive className="w-3 h-3" />
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-900 leading-relaxed">
                        {feedback.question}
                      </p>
                    </div>
                  </div>

                  {/* Existing Answer */}
                  {feedback.answer && (
                    <div className="ml-14 pl-4 border-l-2 border-blue-200 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">Your response:</span>
                      </div>
                      <p className="text-gray-900 leading-relaxed">
                        {feedback.answer}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === feedback._id && (
                    <div className="ml-14 mt-4">
                      <textarea
                        name="answer"
                        value={answerData.answer || ""}
                        onChange={handleAnswerChange}
                        placeholder="Write your reply..."
                        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      {answerErrors.answer && (
                        <p className="text-red-500 text-sm mt-1">{answerErrors.answer}</p>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitReply(feedback._id)}
                          disabled={answerLoading}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {answerLoading ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {replyingTo !== feedback._id && (
                    <div className="ml-14 mt-4 flex gap-2">
                      {!feedback.isAnswered && !feedback.isArchived && (
                        <button
                          onClick={() => handleReply(feedback._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                      )}
                      {!feedback.isArchived && (
                        <button
                          onClick={() => handleArchive(feedback._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`px-4 py-2 rounded-lg border ${
                  pagination.page === page
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerWallView;
