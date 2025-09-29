import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFeedbackSubmission, usePublicFeedback } from '../hooks/useFeedback';
import { useWall } from '../hooks/useWalls';
import { 
  Send, 
  Heart, 
  Smile, 
  ThumbsUp, 
  Star,
  MessageCircle,
  Users,
  Clock
} from 'lucide-react';

const PublicWallView = () => {
  const { slug } = useParams();
  const { wall, loading: wallLoading, error: wallError } = useWall(slug);
  const { 
    formData, 
    errors, 
    loading: submitLoading, 
    success, 
    handleChange, 
    handleSubmit, 
    resetForm,
    characterCount,
    maxCharacters 
  } = useFeedbackSubmission(slug);
  const { 
    feedbacks, 
    loading: feedbacksLoading, 
    addReaction 
  } = usePublicFeedback(slug);

  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const emojis = [
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '😊', icon: Smile, label: 'Happy' },
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '🔥', icon: Star, label: 'Fire' },
    { emoji: '⭐', icon: Star, label: 'Star' }
  ];

  useEffect(() => {
    if (success) {
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        resetForm();
      }, 3000);
    }
  }, [success, resetForm]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleReaction = async (feedbackId, emoji) => {
    try {
      await addReaction(feedbackId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const getWallThemeStyles = () => {
    if (!wall) return {};
    
    const theme = wall.theme || 'default';
    const customColors = wall.customColors || {};
    
    // Default theme styles
    const themes = {
      default: { 
        bg: 'bg-white', 
        primary: 'text-gray-900', 
        accent: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-gray-200'
      },
      dark: { 
        bg: 'bg-gray-900', 
        primary: 'text-white', 
        accent: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-gray-700'
      },
      ocean: { 
        bg: 'bg-blue-50', 
        primary: 'text-blue-900', 
        accent: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-200'
      },
      forest: { 
        bg: 'bg-green-50', 
        primary: 'text-green-900', 
        accent: 'bg-green-600 hover:bg-green-700',
        border: 'border-green-200'
      },
      sunset: { 
        bg: 'bg-orange-50', 
        primary: 'text-orange-900', 
        accent: 'bg-orange-600 hover:bg-orange-700',
        border: 'border-orange-200'
      },
      minimal: { 
        bg: 'bg-gray-50', 
        primary: 'text-gray-800', 
        accent: 'bg-gray-600 hover:bg-gray-700',
        border: 'border-gray-300'
      }
    };

    return themes[theme] || themes.default;
  };

  const getCustomStyles = () => {
    if (!wall?.customColors) return {};
    
    return {
      backgroundColor: wall.customColors.background,
      color: wall.customColors.primary,
    };
  };

  const getAccentStyles = () => {
    if (!wall?.customColors?.accent) return {};
    
    return {
      backgroundColor: wall.customColors.accent,
    };
  };

  if (wallLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading feedback wall...</p>
        </div>
      </div>
    );
  }

  if (wallError || !wall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wall Not Found</h1>
          <p className="text-gray-600 mb-4">
            The feedback wall you're looking for doesn't exist or has been removed.
          </p>
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your own wall
          </a>
        </div>
      </div>
    );
  }

  const themeStyles = getWallThemeStyles();
  const customStyles = getCustomStyles();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={customStyles}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.primary}`}>
            Send Anonymous Feedback
          </h1>
          <p className={`text-lg opacity-75 ${themeStyles.primary}`}>
            Share your honest thoughts with @{wall.slug}
          </p>
        </div>

        {/* Thank You Message */}
        {showThankYou && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-green-700">
              Your anonymous message has been sent successfully.
            </p>
          </div>
        )}

        {/* Feedback Form */}
        <div 
          className={`${themeStyles.bg} rounded-xl shadow-lg p-8 mb-12 ${themeStyles.border} border`}
          style={customStyles}
        >
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className={`block text-lg font-medium mb-3 ${themeStyles.primary}`}>
                What's on your mind?
              </label>
              <textarea
                value={formData.question}
                onChange={handleChange}
                placeholder="Share your thoughts, suggestions, or questions anonymously..."
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500 ${themeStyles.border}`}
                disabled={submitLoading}
              />
              
              <div className="flex justify-between items-center mt-2">
                <div>
                  {errors.question && (
                    <p className="text-red-500 text-sm">{errors.question}</p>
                  )}
                </div>
                <span className={`text-sm ${characterCount > maxCharacters * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>

            <button
              onClick={handleFeedbackSubmit}
              disabled={submitLoading || !formData.question.trim()}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.accent}`}
              style={wall.customColors?.accent ? getAccentStyles() : {}}
            >
              {submitLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Anonymous Feedback
                </>
              )}
            </button>
          </div>
        </div>

        {/* Public Feedback Display */}
        {feedbacks && feedbacks.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className={`text-2xl font-bold mb-2 ${themeStyles.primary}`}>
                Recent Feedback & Responses
              </h2>
              <p className={`opacity-75 ${themeStyles.primary}`}>
                See what others are saying and how @{wall.slug} responds
              </p>
            </div>

            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div 
                  key={feedback._id}
                  className={`${themeStyles.bg} rounded-lg shadow-sm p-6 ${themeStyles.border} border`}
                  style={customStyles}
                >
                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`${themeStyles.primary} leading-relaxed`}>
                          {feedback.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {feedback.answer && (
                    <div className="ml-11 pl-4 border-l-2 border-blue-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-sm font-medium text-blue-600">
                          @{wall.slug} replied:
                        </div>
                      </div>
                      <p className={`${themeStyles.primary} leading-relaxed`}>
                        {feedback.answer}
                      </p>
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {emojis.map(({ emoji, label }) => {
                        const count = feedback.reactions?.[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(feedback._id, emoji)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-gray-600">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className={`opacity-75 mb-4 ${themeStyles.primary}`}>
            Want to create your own feedback wall?
          </p>
          <a
            href="/"
            className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors ${themeStyles.accent}`}
            style={wall.customColors?.accent ? getAccentStyles() : {}}
          >
            Create Your Wall
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicWallView;