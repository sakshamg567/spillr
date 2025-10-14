import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOwnerFeedback, useFeedbackAnswer } from "../hooks/useFeedback";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Reply,
  CheckCircle,
  Clock,
} from "lucide-react";

const FeedbackManagement = () => {
  const { user } = useAuth();
const feedbackIdentifier = user?.username || user?.slug;

    const {
    feedbacks,
    pagination,
    filters,
    loading,
    error,
    stats,
    updateFilters,
    changePage,
  } = useOwnerFeedback(feedbackIdentifier);


  const {
    formData: answerFormData,
    errors: answerErrors,
    loading: answerLoading,
    handleChange: handleAnswerChange,
    handleSubmit: submitAnswer,
    resetForm: resetAnswerForm,
  } = useFeedbackAnswer();

  const [showAnswerForm, setShowAnswerForm] = useState(null);

  const handleAnswerSubmit = async (feedbackId) => {
    try {
      await submitAnswer(feedbackId, () => {
        setShowAnswerForm(null);
        resetAnswerForm();
        toast.success("Response posted successfully! ✅");
      });
    } catch (error) {
      console.error("Answer submission error:", error);
      toast.error("Failed to post response");
    }
  };

 
  const getStatusBadge = (feedback) => {
    if (feedback.isAnswered)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Answered
        </span>
      );

      // inside useOwnerFeedback
const fetchFeedback = async (overrides = {}) => {
  try {
    setLoading(true);
    const qs = new URLSearchParams({
      sort: filters.sort || 'active',
      page: String(filters.page || 1),
      limit: String(filters.limit || 10),
      ...(overrides || {}),
    }).toString();

    const res = await fetch(`${API_BASE_URL}/api/feedback/owner/${slug}?${qs}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch feedback');
    }

    const body = await res.json();

    
    setFeedbacks(body.feedbacks || []);
    setPagination(body.pagination || {});
    setStats(body.stats || { total: 0, answered: 0, archived: 0, active: 0, answerRate: 0 });

  } catch (err) {
    setError(err.message || 'Unable to fetch feedback');
  } finally {
    setLoading(false);
  }
};

const updateFilters = (partial) => {
  setFilters(prev => {
    const next = { ...prev, ...partial };
    return next;
  });
  
  setTimeout(() => { 
    fetchFeedback({ sort: partial.sort, page: 1 });
  }, 0);
};

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };


  if (loading && !feedbacks.length)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading feedback...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Feedback
          </h1>
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

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Messages
          </h1>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className=" rounded-lg   mb-6">
          <div className="p-6">
           
            <div className="flex flex-wrap items-center  p-1  rounded-lg gap-3"> Sort by:
              {[
  { key: "active", label: "Active", count: stats?.active },
  { key: "answered", label: "Answered", count: stats?.answered   },
  
].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => updateFilters({ sort: tab.key, page: 1 })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filters.sort === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {feedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.search
                  ? "No matching feedback found"
                  : "No feedback yet"}
              </h3>
              <p className="text-gray-500">
                {filters.search
                  ? "Try adjusting your search terms or filters"
                  : "Feedback will appear here once people start submitting"}
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
                          {new Date(feedback.createdAt).toLocaleDateString()} •{" "}
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-900">{feedback.question}</p>
                      </div>

                      {/* Answer Section */}
                      {feedback.answer && (
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                          <p className="text-gray-900">{feedback.answer}</p>
                          <p className="text-sm text-blue-700 mt-2">
                            Your response •{" "}
                            {new Date(feedback.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-2">
                      {!feedback.isAnswered && (
                        <button
                          onClick={() =>
                            setShowAnswerForm(
                              showAnswerForm === feedback._id
                                ? null
                                : feedback._id
                            )
                          }
                          className="p-2 hover:text-gray-400 text-gray-600 transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Answer Form */}
                  {showAnswerForm === feedback._id && (
                    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Write your response
                      </h4>

                      <textarea
                        placeholder="Type your response..."
                        value={answerFormData.answer}
                        onChange={handleAnswerChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />

                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => {
                            setShowAnswerForm(null);
                            resetAnswerForm();
                          }}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAnswerSubmit(feedback._id)}
                          disabled={
                            answerLoading || !answerFormData.answer.trim()
                          }
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                        >
                          {answerLoading ? "Posting..." : "Post Response"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
