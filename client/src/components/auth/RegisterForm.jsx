import React from "react";
import { Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react";
import { useRegisterForm } from "../../hooks/useAuth";

const RegisterForm = ({ onSuccess, onToggleLogin, onCancel, onForgotPassword }) => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useRegisterForm();

  // Wrap handleSubmit to include success callback
  const handleRegister = async (e) => {
    await handleSubmit(e);
    if (!errors.submit) {
      if (onSuccess) onSuccess(); // close modal
      // navigate("/dashboard"); // redirect - removed to fix Router error
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6 text-center space-y-4 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
            <p className="text-muted-foreground text-sm">
              Join us and start your journey today
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
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
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-md"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Toggle to Login */}
          {onToggleLogin && (
            <p className="text-center text-sm text-muted-foreground mt-4 ">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleLogin}
                className="text-foreground hover:underline font-medium underline"
              >
                Sign in
              </button>
            </p>
          )}

          {/* Back to Home */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;