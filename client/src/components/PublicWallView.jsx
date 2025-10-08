import React, { useState } from 'react';
import {
  Eye, 
  Send, 
  Heart, 
  Smile, 
  ThumbsUp, 
  Star,
  Users,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';

const PublicWallPreview = ({ username }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [testQuestion, setTestQuestion] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const wallUrl = `${window.location.origin}/wall/${username}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(wallUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTestSubmit = () => {
    if (testQuestion.trim()) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTestQuestion("");
      }, 3000);
    }
  };

  const emojis = [
    { emoji: '❤️', icon: Heart },
    { emoji: '😊', icon: Smile },
    { emoji: '👍', icon: ThumbsUp },
    { emoji: '⭐', icon: Star }
  ];

  // Sample feedback data
  const sampleFeedback = [
    {
      _id: "1",
      question: "What's your favorite programming language and why?",
      answer: "I really enjoy working with JavaScript and React. The ecosystem is vast and it allows me to build both web and mobile applications efficiently!",
      reactions: { "❤️": 12, "👍": 8, "😊": 5 },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "2",
      question: "How do you stay motivated when learning new technologies?",
      answer: "I set small, achievable goals and celebrate each milestone. Also, building real projects helps me see the practical value of what I'm learning.",
      reactions: { "😊": 15, "⭐": 10, "👍": 7 },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Share URL Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Feedback Page</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with others so they can send you anonymous feedback
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={wallUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <a
                href={wallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Eye className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Public View Preview</h4>
            <p className="text-sm text-yellow-700">
              This is how your feedback page looks to visitors. Test it by submitting a question below.
            </p>
          </div>
        </div>
      </div>

      {/* Public Wall Preview */}
      <div className="bg-white rounded-xl shadow-lg border p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Send Anonymous Feedback
            </h1>
            <p className="text-lg text-gray-600">
              Share your honest thoughts with @{username}
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6 text-center animate-fade-in">
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
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <label className="block text-lg font-medium text-gray-900 mb-3">
              What's on your mind?
            </label>
            <textarea
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Share your thoughts, suggestions, or questions anonymously..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {testQuestion.length}/2000 characters
              </span>
              <button
                onClick={handleTestSubmit}
                disabled={!testQuestion.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Anonymous Feedback
              </button>
            </div>
          </div>

          {/* Recent Feedback Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Recent Feedback & Responses
              </h2>
              <p className="text-gray-600">
                See what others are saying and how @{username} responds
              </p>
            </div>

            {/* Sample Feedback Items */}
            <div className="space-y-4">
              {sampleFeedback.map((feedback) => (
                <div 
                  key={feedback._id}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 leading-relaxed">
                          {feedback.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {feedback.answer && (
                    <div className="ml-11 pl-4 border-l-2 border-blue-200 mb-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="text-sm font-medium text-blue-600">
                          @{username} replied:
                        </div>
                      </div>
                      <p className="text-gray-900 leading-relaxed">
                        {feedback.answer}
                      </p>
                    </div>
                  )}

                  {/* Reactions & Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {Object.entries(feedback.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                        >
                          <span>{emoji}</span>
                          <span className="text-gray-600 font-medium">{count}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {feedback.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-12 text-center pt-8 border-t">
            <p className="text-gray-600 mb-4">
              Want to create your own feedback page?
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicWallPreview;