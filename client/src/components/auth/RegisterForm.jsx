import React from "react";
import { Mail, Lock, User, Eye, EyeOff, Chrome, AtSign } from "lucide-react";
import { useRegisterForm } from "../../hooks/useAuth";
import { useState } from "react";

const RegisterForm = ({
  onSuccess,
  onToggleLogin,
  onCancel,
  onForgotPassword,
}) => {
  const { formData, errors, loading, handleChange, handleSubmit } =
    useRegisterForm();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const result = await handleSubmit(e);
    
      if (result?.success && onSuccess) {
        console.log("Registration successful, calling onSuccess callback");
        onSuccess();
      }
    } catch (error) {
      console.error("Registration error:", error);
      
    }
  };
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6 text-center space-y-4 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Join us and start your journey today
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {errors.submit && (
              <div className="text-red-700 bg-red-100 border border-red-400 px-4 py-3 rounded-md text-sm text-center font-medium" role="alert">
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
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange("username")}
                  className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.username}
                </p>
              )}
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
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-2 pl-10 pr-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Toggle to Login */}
          {onToggleLogin && (
            <p className="text-center text-sm text-muted-foreground mt-4">
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