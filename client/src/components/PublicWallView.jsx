import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MessageCircle, RefreshCw } from "lucide-react";
import Footer from "./Footer";
import { useAuth } from "../hooks/useAuth";

const PublicWallView = ({ logout }) => {
  const { user, isAuthenticated } = useAuth();
  const handleNavigation = (path) => navigate(path);
  const { slug } = useParams();
  const [formData, setFormData] = useState({ question: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [answeredFeedbacks, setAnsweredFeedbacks] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeItem, setActiveItem] = useState(
    isAuthenticated ? "Dashboard" : "Register"
  );
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const navRefs = useRef({});

  const updateIndicator = (label) => {
    const el = navRefs.current[label];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth,
        left: el.offsetLeft,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeItem);
  }, [activeItem, isAuthenticated]);

  const getNavItems = (loggedIn) =>
    loggedIn
      ? [
          { label: "Home", onClick: () => handleNavigation("/") },
          { label: "Dashboard", onClick: () => handleNavigation("/dashboard") },
          { label: "Settings", onClick: () => handleNavigation("/settings") },
          { label: "Logout", onClick: logout },
        ]
      : [
          { label: "Home", onClick: () => handleNavigation("/") },
          { label: "Register", onClick: () => handleNavigation("/register") },
          { label: "Login", onClick: () => handleNavigation("/login") },
        ];

  const items = getNavItems(isAuthenticated);

  const handleItemClick = (item) => {
    item.onClick();
    setActiveItem(item.label);
  };

  useEffect(() => {
    const handleResize = () => updateIndicator(activeItem);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeItem]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // FIXED: Separate fetch functions with better error handling
  const fetchUserProfile = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoadingProfile(true);
      const response = await fetch(`${API_BASE_URL}/api/public/wall/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setError("");
      } else {
        const errorData = await response.json();
        console.error("Wall not found:", errorData.error);
        setError(errorData.error || "Wall not found");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }, [slug, API_BASE_URL]);

  const fetchAnsweredFeedback = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoadingFeedback(true);
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/wall/${slug}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnsweredFeedbacks(data.feedbacks || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoadingFeedback(false);
    }
  }, [slug, API_BASE_URL]);

  // Initial load
  useEffect(() => {
    if (slug) {
      fetchUserProfile();
      fetchAnsweredFeedback();
    }
  }, [slug, fetchUserProfile, fetchAnsweredFeedback]);

  
  useEffect(() => {
    if (!slug) return;

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing public feedback...');
      fetchAnsweredFeedback();
    }, 20000); // 20 seconds

    return () => clearInterval(intervalId);
  }, [slug, fetchAnsweredFeedback]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchUserProfile(), fetchAnsweredFeedback()]);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUserProfile, fetchAnsweredFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const question = formData.question.trim();
    if (!question) {
      setError("Please enter your message");
      return;
    }

    if (question.length > 500) {
      setError("Message is too long (max 500 characters)");
      return;
    }

    if (!userProfile?.slug) {
      setError("Wall information not available");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          wallSlug: userProfile.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }
      
      setSent(true);
      setFormData({ question: "" });
      
      // Refresh feedback after submission (answer might appear)
      setTimeout(() => {
        fetchAnsweredFeedback();
      }, 2000);

    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => setSent(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [sent]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading wall...</p>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div
          className="text-center max-w-md mx-auto px-4 w-full bg-white border border-black shadow-[4px_4px_0_0_#000] rounded-none p-4"
          style={{ fontFamily: "Space Grotesk" }}
        >
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wall Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-20 h-12 bg-yellow-200 shadow-card shadow-[4px_4px_0_0_#000] disabled:bg-gray-900 disabled:text-white text-black font-medium transition-colors cursor-pointer hover:border hover:border-2"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef9f3] text-black font-['Space_Grotesk']">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center bg-yellow-200 border-b-1 border-black h-16 z-50">
        <div className="w-full flex justify-between items-center px-4">
          {/* Logo */}
          <div
            onClick={() => handleNavigation("/")}
            className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black cursor-pointer"
          >
            Spillr
          </div>
          <nav className="relative flex items-center gap-3">
            {/* Moving indicator */}
            <div
              className="absolute bottom-0 h-[4px] bg-black transition-all duration-300 ease-out pointer-events-none"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
            />

            {items.map((item) => (
              <button
                key={item.label}
                ref={(el) => (navRefs.current[item.label] = el)}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => updateIndicator(item.label)}
                onMouseLeave={() => updateIndicator(activeItem)}
                className={`px-3 py-2 text-sm tracking-wide transition-colors duration-200 ${
                  activeItem === item.label
                    ? "text-black"
                    : "text-black hover:text-gray-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20 space-y-12">
        {/* Profile Section */}
        <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0_0_#000]">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 border-4 border-black bg-yellow-100 flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#000]">
              {userProfile?.profilePicture ? (
                <img
                  src={
                    userProfile.profilePicture?.startsWith("http")
                      ? userProfile.profilePicture
                      : `${API_BASE_URL}/${userProfile.profilePicture.replace(
                          /^\/+/,
                          ""
                        )}`
                  }
                  alt={userProfile.name || "Profile picture"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-extrabold">
                  {userProfile?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black mb-1">{userProfile?.name}</h1>
            {userProfile?.bio && (
              <p className="text-base text-gray-700 max-w-md">
                {userProfile.bio}
              </p>
            )}
            <span className="text-sm font-medium mt-2">@{slug}</span>
          </div>
        </div>

        {/* Message Form */}
        <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0_0_#000]">
          <h2 className="text-2xl font-black mb-6">
            Send an anonymous message to {userProfile?.name || "the user"}
          </h2>

          {error && (
            <div className="border-2 border-black bg-red-100 p-4 mb-4 font-bold shadow-[3px_3px_0_0_#000]">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ question: e.target.value })}
              placeholder="Say something real. Your name won't be shown."
              rows={6}
              maxLength={500}
              className="w-full border-2 border-black bg-yellow-50 p-4 text-base focus:outline-none focus:ring-0 shadow-[3px_3px_0_0_#000]"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-bold">
                {formData.question.length}/500
              </span>
              <button
                type="submit"
                disabled={loading || !formData.question.trim()}
                className={`border-1 border-black px-6 py-3 font-bold shadow-[4px_4px_0_0_#000] transition
                  ${sent ? "bg-green-400 text-black" : "bg-black text-white hover:bg-yellow-200 hover:text-black"}
                  disabled:opacity-50`}
              >
                <span>{sent ? "Sent" : loading ? "Sending..." : "Send"}</span>
                <Send className="w-4 h-4 inline-block ml-2" />
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm font-medium">
            – Messages appear only after being answered.
          </p>
        </div>

        {/* Answered Messages Section */}
        {answeredFeedbacks.length > 0 ? (
          <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0_0_#000]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">Answered Messages</h3>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50"
                title="Refresh messages"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {loadingFeedback && answeredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 mb-4 text-right">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
                <div className="space-y-6">
                  {answeredFeedbacks.map((f) => (
                    <div key={f._id} className="border-b-2 border-black pb-4">
                      <p className="font-semibold">{f.question}</p>
                      {f.answer && (
                        <div className="mt-3 border-l-4 border-black pl-4">
                          <p>{f.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0_0_#000]">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-black" />
            <h3 className="text-xl font-black mb-2">
              No answered messages yet
            </h3>
            <p className="text-base">
              {userProfile?.name || "This user"} hasn't answered any messages yet.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PublicWallView;