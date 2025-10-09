import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, MessageCircle, Eye } from 'lucide-react';

const PublicWallView = () => {
  const { username } = useParams();
  console.log("PUBLIC WALL — username:", username); 
  const [formData, setFormData] = useState({ question: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [answeredFeedbacks, setAnsweredFeedbacks] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/wall/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else {
        console.error("Wall not found");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAnsweredFeedback = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${username}/public`);
      if (response.ok) {
        const data = await response.json();
        setAnsweredFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    }
  };

  if (username) {
    fetchUserProfile();
    fetchAnsweredFeedback();
  }
}, [username, API_BASE_URL]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      setError('Please enter your message');
      return;
    }

    if (formData.question.length > 500) {
      setError('Message is too long (max 500 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: formData.question }),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ question: '' });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
   <div
  className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50"
  style={{
    backgroundColor: userProfile?.customColors?.background || undefined,
    color: userProfile?.customColors?.text || undefined,
  }}
>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-white font-bold text-2xl tracking-wider">
                <span className="text-3xl">∞</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-white text-sm">
              <Link to="/" className="hover:text-purple-200 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-purple-200 transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-purple-200 transition-colors">Contact Us</Link>
              <Link to="/register" className="hover:text-purple-200 transition-colors">Register</Link>
              <Link to="/login" className="hover:text-purple-200 transition-colors">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mb-4">
              {userProfile?.profilePicture ? (
                <img 
                  src={userProfile.profilePicture} 
                  alt={userProfile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-5xl font-bold">
                  {userProfile?.name?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userProfile?.name || username}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Last seen: hidden</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Send an anonymous message to {userProfile?.name || username}
          </h2>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">Message sent successfully! ✓</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ question: e.target.value })}
              placeholder="Share your thoughts, your name wont be shown."
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-gray-900 placeholder-gray-400"
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {formData.question.length}/500
              </span>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>📷</span>
                  <span className="text-sm">Upload Image</span>
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.question.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
            <span className="text-lg">ℹ️</span>
            <p>Messages will not show here until answered.</p>
          </div>
        </div>

        {/* Answered Messages Section */}
        {answeredFeedbacks.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Answered Messages</h3>
            <div className="space-y-6">
              {answeredFeedbacks.map((feedback) => (
                <div key={feedback._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-800">{feedback.question}</p>
                  </div>
                  {feedback.answer && (
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <p className="text-gray-800 mb-2">{feedback.answer}</p>
                      <p className="text-xs text-purple-600">
                        - {userProfile?.name || username}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No answered messages yet</h3>
            <p className="text-gray-600">
              {userProfile?.name || username} hasn't answered any messages yet. Send a message that might be the first!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">∞</span>
              <span>© 2025 SayOut.Net</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-purple-600 transition-colors">Terms & Conditions</Link>
              <span>-</span>
              <Link to="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">🐦</a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">📘</a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">📷</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicWallView;