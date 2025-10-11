"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Send, MessageCircle, Eye } from "lucide-react"

const PublicWallView = () => {
  const { slug } = useParams()
  const [formData, setFormData] = useState({ question: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [userProfile, setUserProfile] = useState(null)
  const [answeredFeedbacks, setAnsweredFeedbacks] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/wall/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        } else {
          const errorData = await response.json()
          console.error("Wall not found:", errorData.error)
          setError(errorData.error || "Wall not found")
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setError("Failed to load profile")
      } finally {
        setLoadingProfile(false)
      }
    }

    const fetchAnsweredFeedback = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/wall/${slug}/feedbacks`)
        if (response.ok) {
          const data = await response.json()
          setAnsweredFeedbacks(data.feedbacks || [])
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err)
      }
    }

    if (slug) {
      fetchUserProfile()
      fetchAnsweredFeedback()
    }
  }, [slug, API_BASE_URL])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      setError("Please enter your message")
      return
    }

    if (formData.question.length > 500) {
      setError("Message is too long (max 500 characters)")
      return
    }

    if (!userProfile?.slug) {
      setError("Wall information not available")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          wallSlug: userProfile.slug,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ question: "" })
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to send message")
      }
    } catch (err) {
      setError("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wall Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block rounded-lg border border-foreground px-6 py-3 font-medium bg-foreground text-background hover:opacity-90 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="font-bold text-2xl tracking-wider">
                
                <span className="sr-only">Home</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="hover:underline underline-offset-4">
                Home
              </Link>
              <Link to="/about" className="hover:underline underline-offset-4">
                About Us
              </Link>
              <Link to="/contact" className="hover:underline underline-offset-4">
                Contact Us
              </Link>
              <Link to="/register" className="hover:underline underline-offset-4">
                Register
              </Link>
              <Link to="/login" className="hover:underline underline-offset-4">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* User Profile Card */}
        <div className="bg-background rounded-2xl border border-border p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full ring-1 ring-border bg-background overflow-hidden flex items-center justify-center mb-4">
              {userProfile?.profilePicture ? (
                <img
                  src={
                    userProfile.profilePicture?.startsWith("http")
                      ? userProfile.profilePicture
                      : `${API_BASE_URL}/${userProfile.profilePicture.replace(/^\/+/, "")}`
                  }
                  alt={userProfile.name || "Profile picture"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold">{userProfile?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{userProfile?.name || undefined}</h1>

            {userProfile?.bio && <p className="text-muted-foreground text-center max-w-md mb-4">{userProfile.bio}</p>}

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">@{slug}</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-background rounded-2xl border border-border p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Send an anonymous message to {userProfile?.name || "the user"}</h2>

          {success && (
            <div className="bg-muted border border-border rounded-lg p-4 mb-6">
              <p className="font-medium">
                <span className="font-semibold">Success:</span> Message sent.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-muted border border-border rounded-lg p-4 mb-6">
              <p>
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ question: e.target.value })}
              placeholder="Share your thoughts, your name won't be shown."
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">{formData.question.length}/500</span>

              <button
                type="submit"
                disabled={loading || !formData.question.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-foreground bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <span aria-hidden="true">ℹ️</span>
            <p>Messages will not show here until answered.</p>
          </div>
        </div>

        {/* Answered Messages Section */}
        {answeredFeedbacks.length > 0 ? (
          <div className="bg-background rounded-2xl border border-border p-8">
            <h3 className="text-2xl font-bold mb-6">Answered Messages</h3>
            <div className="space-y-6">
              {answeredFeedbacks.map((feedback) => (
                <div key={feedback._id} className="border-b border-border pb-6 last:border-0">
                  <div className="bg-muted rounded-lg p-4 mb-3">
                    <p>{feedback.question}</p>
                  </div>
                  {feedback.answer && (
                    <div className="bg-background rounded-lg p-4 border-l-2 border-foreground">
                      <p className="mb-2">{feedback.answer}</p>
                      <p className="text-xs text-muted-foreground">- {userProfile?.name || "User"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-background rounded-2xl border border-border p-12 text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No answered messages yet</h3>
            <p className="text-muted-foreground">
              {userProfile?.name || "This user"} hasn't answered any messages yet. Be the first to send one!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">∞</span>
              <span>© 2025 Spillr</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:underline underline-offset-4">
                Terms & Conditions
              </Link>
              <span aria-hidden="true">-</span>
              <Link to="/privacy" className="hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicWallView
