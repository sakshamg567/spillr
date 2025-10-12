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
    newFeedback: false,
    
    ...profile?.emailNotifications,
  });
const [savingNotifications, setSavingNotifications] = useState(false);
const [savedState, setSavedState] = useState(false);


const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    if (profile?.emailNotifications) {
      setNotifications({
        newFeedback: profile.emailNotifications.newFeedback ?? false,
      });
    }
  }, [profile]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

const handleProfilePictureChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const localPreview = URL.createObjectURL(file);
  setPreviewImage(localPreview); 

  try {
    await handleFileUpload(file);
    await updateProfile(); 
  } catch (error) {
    console.error("Profile picture upload error:", error);
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
    setSavingNotifications(true);
    await updateProfile({ emailNotifications: notifications });
    setSavedState(true);

    // revert to default after 2 seconds
    setTimeout(() => setSavedState(false), 2000);
  } catch (error) {
    console.error("Failed to update notifications:", error);
  } finally {
    setSavingNotifications(false);
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
    previewImage
      ? previewImage
      : profile?.profilePicture
      ? (profile.profilePicture.startsWith("http")
          ? profile.profilePicture
          : `${import.meta.env.VITE_API_BASE_URL}${profile.profilePicture}`)
      : ""
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
                   <button
  onClick={async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const originalText = "Save Changes";

    try {
      await handleProfileSubmit();
      btn.textContent = "Saved ";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error("Save failed:", error);
      btn.textContent = "Failed ";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  }}
  disabled={profileLoading}
  className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 hover:bg-gray-800 transition-colors min-w-[150px]"
>
  <Save className="w-4 h-4" />
  <span>Save Changes</span>
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
                        Must be 6+ characters with uppercase, lowercase,
                        number
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
                
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Email notifications
                        </h4>
                        <p className="text-sm text-gray-600">
                          Get notified when someone sends a message
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

                  </div>

                  <button
  onClick={saveNotifications}
  disabled={savingNotifications}
  className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
>
  <Save className="w-4 h-4" />
  {savingNotifications
    ? "Saving..."
    : savedState
    ? "Saved!"
    : "Save Settings"}
</button>

                </div>
              </div>
            )}

 </div>
        </div>
      </div>
    </div>)}
export default UserSettings;
