import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOwnerFeedback, useFeedbackAnswer } from '../hooks/useFeedback';
import { 
  MessageCircle, 
  Reply, 
  Archive, 
  Search, 
  Filter, 
  MoreVertical,
  ExternalLink,
  CheckCircle,
  Clock,
  ArchiveIcon
} from 'lucide-react';

const FeedbackManagement = () => {
  const { wallId } = useParams();
  const {
    feedbacks,
    pagination,
    filters,
    loading,
    error,
    stats,
    updateFilters,
    changePage,
    answerFeedback,
    archiveFeedback
  } = useOwnerFeedback(wallId);

  const {
    formData: answerFormData,
    errors: answerErrors,
    loading: answerLoading,
    handleChange: handleAnswerChange,
    handleSubmit: submitAnswer,
    resetForm: resetAnswerForm
  } = useFeedbackAnswer();

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAnswerSubmit = async (feedbackId) => {
    try {
      await submitAnswer(feedbackId, (updatedFeedback) => {
        setShowAnswerForm(null);
        resetAnswerForm();
      });
    } catch (error) {
      console.error('Answer submission error:', error);
    }
  };

  const handleArchive = async (feedbackId, archived = true) => {
    try {
      await archiveFeedback(feedbackId, archived);
    } catch (error) {
      console.error('Archive error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, page: 1 });
  };

  const getStatusBadge = (feedback) => {
    if (feedback.isArchived) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          <ArchiveIcon className="w-3 h-3" />
          Archived
        </span>
      );
    }
    if (feedback.isAnswered) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Answered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  if (loading && !feedbacks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Feedback</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 mt-1">Manage and respond to feedback on your wall</p>
            </div>
            <a
              href={`/wall/${wallId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Wall
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Answered</p>
                <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.answerRate}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Filter Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                {[
                  { key: 'active', label: 'Active', count: stats.active },
                  { key: 'answered', label: 'Answered', count: stats.answered },
                  { key: 'archived', label: 'Archived', count: stats.archived }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => updateFilters({ sort: tab.key, page: 1 })}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filters.sort === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {feedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.search ? 'No matching feedback found' : 'No feedback yet'}
              </h3>
              <p className="text-gray-500">
                {filters.search 
                  ? 'Try adjusting your search terms or filters'
                  : 'Feedback will appear here once people start submitting to your wall'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(feedback)}
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()} at{' '}
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {/* Question */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-900">{feedback.question}</p>
                      </div>

                      {/* Answer */}
                      {feedback.answer && (
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                          <p className="text-gray-900">{feedback.answer}</p>
                          <p className="text-sm text-blue-700 mt-2">
                            Your response • {new Date(feedback.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Answer Form */}
                      {showAnswerForm === feedback._id && (
                        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Write your response</h4>
                          
                          {answerErrors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
                              {answerErrors.submit}
                            </div>
                          )}

                          <textarea
                            placeholder="Type your response..."
                            value={answerFormData.answer}
                            onChange={handleAnswerChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                          
                          {answerErrors.answer && (
                            <p className="text-red-500 text-sm mt-1">{answerErrors.answer}</p>
                          )}

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500">
                              {answerFormData.answer.length}/2000 characters
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setShowAnswerForm(null);
                                  resetAnswerForm();
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAnswerSubmit(feedback._id)}
                                disabled={answerLoading || !answerFormData.answer.trim()}
                                className="px-4 py-2 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                              >
                                {answerLoading ? 'Posting...' : 'Post Response'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reactions */}
                      {feedback.reactions && Object.keys(feedback.reactions).length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-600">Reactions:</span>
                          {Object.entries(feedback.reactions).map(([emoji, count]) => (
                            <span key={emoji} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {!feedback.isAnswered && !feedback.isArchived && (
                        <button
                          onClick={() => setShowAnswerForm(showAnswerForm === feedback._id ? null : feedback._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Reply to feedback"
                        >
                          <Reply className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleArchive(feedback._id, !feedback.isArchived)}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title={feedback.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalFeedbacks)} of{' '}
              {pagination.totalFeedbacks} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, pagination.currentPage - 2);
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        pageNum === pagination.currentPage
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;