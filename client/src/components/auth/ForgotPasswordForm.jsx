import React, { useState } from "react";
import { Mail } from "lucide-react";
import { validateEmail } from "../../utils/validation";

const ForgotPasswordForm = ({ onCancel }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset link sent! Check your email.");
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
        <div className="flex flex-col text-center p-6 space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <Mail className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we’ll send you a reset link.
          </p>
        </div>

        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 px-4 py-3 rounded-lg text-sm bg-red-50">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 px-4 py-3 rounded-lg text-sm bg-green-50">
                {success}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
