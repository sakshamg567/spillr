import React, { useState, useEffect } from "react";
import {
  useUser,
  usePasswordChange,
  useProfileForm,
  useProfilePictureUpload,
} from "../hooks/useUser";
import {
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const UserSettings = () => {
  const { profile, loading, updateProfile } = useUser();
  const {
    formData: passwordData,
    errors: passwordErrors,
    loading: passwordLoading,
    success: passwordSuccess,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
  } = usePasswordChange();

  const {
    formData: profileData,
    errors: profileErrors,
    loading: profileLoading,
    handleChange: handleProfileChange,
    handleSubmit: handleProfileSubmit,
  } = useProfileForm(profile);

  const {
    loading: uploadLoading,
    error: uploadError,
    handleFileUpload,
  } = useProfilePictureUpload();

  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [notifications, setNotifications] = useState({
    newFeedback: true,
    responses: true,
    weekly: false,
    ...profile?.emailNotifications,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (profile?.emailNotifications) {
      setNotifications({
        newFeedback: profile.emailNotifications.newFeedback ?? true,
        responses: profile.emailNotifications.responses ?? true,
        weekly: profile.emailNotifications.weekly ?? false,
      });
    }
  }, [profile]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await handleFileUpload(file);
      } catch (error) {
        console.error("Profile picture upload error:", error);
      }
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveNotifications = async () => {
    try {
      await updateProfile({ emailNotifications: notifications });
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  const handleAccountDeletion = async () => {
    if (!deletePassword) {
      alert("Please enter your password to confirm deletion");
      return;
    }

    try {
      const response = await fetch("/api/settings/request-account-deletion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: deletePassword }),
      });

      if (response.ok) {
        alert("Account deletion confirmation sent to your email");
        setShowDeleteConfirm(false);
        setDeletePassword("");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to process deletion request");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("Failed to process deletion request");
    }
  };

  const handleProfileSubmitWrapper = (e) => {
    e.preventDefault();
    handleProfileSubmit();
  };

  const handlePasswordSubmitWrapper = (e) => {
    e.preventDefault();
    handlePasswordSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="p-4 space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === id
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Update your profile details and photo
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                        {profile?.profilePicture ? (
                          <img
                            src={
                              profile.profilePicture.startsWith("http")
                                ? profile.profilePicture
                                : `${import.meta.env.VITE_API_BASE_URL}${
                                    profile.profilePicture
                                  }`
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-gray-500">
                        JPG, PNG or WebP. Max 5MB.
                      </p>
                      {uploadError && (
                        <p className="text-red-500 text-sm mt-1">
                          {uploadError}
                        </p>
                      )}
                      {uploadLoading && (
                        <p className="text-blue-500 text-sm mt-1">
                          Uploading...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="space-y-4">
                    {profileErrors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {profileErrors.submit}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        placeholder="Tell people about yourself..."
                        value={profileData.bio || ""}
                        onChange={handleProfileChange("bio")}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex justify-between text-sm">
                        {profileErrors.bio && (
                          <p className="text-red-500">{profileErrors.bio}</p>
                        )}
                        <span className="text-gray-500 ml-auto">
                          {(profileData.bio || "").length}/500
                        </span>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        Social Links
                      </h4>

                      {[
                        {
                          key: "website",
                          label: "Website",
                          placeholder: "https://yourwebsite.com",
                        },
                        {
                          key: "twitter",
                          label: "Twitter/X",
                          placeholder: "https://twitter.com/username",
                        },
                        {
                          key: "linkedin",
                          label: "LinkedIn",
                          placeholder: "https://linkedin.com/in/username",
                        },
                        {
                          key: "instagram",
                          label: "Instagram",
                          placeholder: "https://instagram.com/username",
                        },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {label}
                          </label>
                          <input
                            type="url"
                            placeholder={placeholder}
                            value={profileData.socialLinks?.[key] || ""}
                            onChange={handleProfileChange(`socialLinks.${key}`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}

                      {profileErrors.socialLinks && (
                        <div className="text-red-500 text-sm">
                          {profileErrors.socialLinks.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Profile Visibility */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Visibility
                      </label>
                      <select
                        value={profileData.profileVisibility || "public"}
                        onChange={handleProfileChange("profileVisibility")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                      </select>
                    </div>

                    <button
                      onClick={handleProfileSubmitWrapper}
                      disabled={profileLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Security Settings
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage your password and security preferences
                  </p>
                </div>

                <div className="p-6">
                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Password changed successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Change Password
                    </h3>

                    {passwordErrors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {passwordErrors.submit}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.old ? "text" : "password"}
                          value={passwordData.oldPassword || ""}
                          onChange={handlePasswordChange("oldPassword")}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              old: !prev.old,
                            }))
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.old ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.oldPassword && (
                        <p className="text-red-500 text-sm">
                          {passwordErrors.oldPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword || ""}
                          onChange={handlePasswordChange("newPassword")}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-sm">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Must be 12+ characters with uppercase, lowercase,
                        number, and special character
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword || ""}
                          onChange={handlePasswordChange("confirmPassword")}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handlePasswordSubmitWrapper}
                      disabled={passwordLoading}
                      className="px-6 py-2 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Notification Settings
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Choose what notifications you want to receive
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          New Feedback
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when someone submits feedback to your
                          walls
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.newFeedback}
                          onChange={(e) =>
                            handleNotificationChange(
                              "newFeedback",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Response Updates
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when people react to your responses
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.responses}
                          onChange={(e) =>
                            handleNotificationChange(
                              "responses",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Weekly Summary
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive a weekly summary of your feedback activity
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.weekly}
                          onChange={(e) =>
                            handleNotificationChange("weekly", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={saveNotifications}
                    className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Privacy & Security
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Control who can see your information and interact with your
                    walls
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Blocked Users
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Users you've blocked cannot send feedback to your walls
                        or interact with your content.
                      </p>

                      <div className="text-center py-8 text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No blocked users</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Blocked IP Addresses
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        IP addresses you've blocked cannot access your feedback
                        walls.
                      </p>

                      <div className="text-center py-8 text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No blocked IP addresses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200">
                <div className="p-6 border-b border-red-200 bg-red-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-red-900">
                        Danger Zone
                      </h2>
                      <p className="text-red-700 mt-1">
                        Irreversible actions that will permanently affect your
                        account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900 mb-2">
                          Delete Account
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                          Permanently delete your account and all associated
                          data. This action cannot be undone. All your feedback
                          walls, responses, and profile information will be
                          permanently removed.
                        </p>

                        <ul className="text-sm text-red-600 mb-4 space-y-1">
                          <li>• All your feedback walls will be deleted</li>
                          <li>
                            • All feedback and responses will be permanently
                            removed
                          </li>
                          <li>
                            • Your profile and account data will be erased
                          </li>
                          <li>• This action cannot be reversed</li>
                        </ul>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-red-300">
                          <h4 className="font-medium text-red-900 mb-2">
                            ⚠️ Final Warning
                          </h4>
                          <p className="text-sm text-red-700 mb-4">
                            You are about to permanently delete your account.
                            This will:
                          </p>
                          <ul className="text-sm text-red-600 mb-4 space-y-1">
                            <li>
                              ✗ Delete all your feedback walls immediately
                            </li>
                            <li>
                              ✗ Remove all feedback and responses permanently
                            </li>
                            <li>✗ Erase your profile and personal data</li>
                            <li>✗ Cannot be undone or recovered</li>
                          </ul>

                          <div className="space-y-3">
                            <input
                              type="password"
                              placeholder="Enter your current password to confirm"
                              value={deletePassword}
                              onChange={(e) =>
                                setDeletePassword(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              required
                            />

                            <div className="flex gap-3">
                              <button
                                onClick={handleAccountDeletion}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                              >
                                Yes, Delete My Account Forever
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeletePassword("");
                                }}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
