import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { validateEmail, validateLoginPassword } from "../../utils/validation";
import { useAuth } from "../../hooks/useAuth";

const LoginForm = ({ onSuccess, onToggleRegister, onCancel, onForgotPassword }) => {
  const { initiateGoogleAuth, login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validateLoginPassword(formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await login({ email: formData.email, password: formData.password });

      console.log("Login successful:", formData.email);
      if (onSuccess) onSuccess();
      // navigate("/dashboard"); // ✅ redirect after email login - removed to fix Router error
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await initiateGoogleAuth();
      // navigate("/dashboard"); // ✅ redirect after Google login - removed to fix Router error
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      setErrors({
        submit: "Google sign-in failed. Please try again.",
      });
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword(formData.email);
    } else {
      alert(
        `Forgot Password functionality not implemented yet. ${
          formData.email ? `Email: ${formData.email}` : "Please enter your email first."
        }`
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
        {/* Header */}
        <div className="flex flex-col text-center p-6 space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <LogIn className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Sign in with email
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Form */}
        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="text-red-500 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange("email")}
                className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground " />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange("password")}
                className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 pr-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors cursor-pointer "
            >
              {loading ? (
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-4 text-sm text-muted-foreground">
              Or sign in with
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Google Sign-in */}
          <div className="flex justify-center">
            <button
              onClick={handleGoogleSignIn}
              className="w-12 h-10 flex items-center justify-center cursor-pointer"
            >
              <img
                src="/src/assets/google-icon-svg-download-png-7683441.webp"
                alt="Google"
              />
            </button>
          </div>

          {/* Toggle Register */}
          {onToggleRegister && (
            <p className="text-center text-sm  mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onToggleRegister}
                className=" hover:underline font-medium underline"
              >
                Sign up
              </button>
            </p>
          )}

          {/* Cancel */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-2 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;