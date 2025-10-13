import { useState, useEffect } from "react";
import {
  useUser,
  usePasswordChange,
  useAccountDeletion
} from "../hooks/useUser";

import {
  User,
  Lock,
  Bell,
  Trash2,
  Images,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";


const UserSettings = () => {
  
  const { profile, loading, updateProfile ,uploadProfilePicture,updateNotifications,reloadProfile} = useUser(true);

  const [showPasswords, setShowPasswords] = useState({
  old: false,
  new: false,
  confirm: false,
});
  const {
    formData: passwordData,
    errors: passwordErrors,
    loading: passwordLoading,
    success: passwordSuccess,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
    resetForm:resetPasswordForm,
  } = usePasswordChange();

  const {
    loading: deletionLoading,
    success: deletionSuccess,
    error: deletionError,
    requestDeletion,
    resetState: resetDeletionState,
  } = useAccountDeletion();

  
   const [activeTab, setActiveTab] = useState("profile");
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [notifications, setNotifications] = useState({
    newFeedback: false,
  });

useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
      });
      setNotifications({
        newFeedback: profile.emailNotifications?.newFeedback ?? false,
      });
    }
  }, [profile]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

const handleProfileChange = (field) => (e) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
  };

 const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);
    try {
      await uploadProfilePicture(file);
      await reloadProfile();
    } catch (err) {
      alert(err.message || "Failed to upload picture");
    }
  };

const handleSaveProfile = async () => {
  setSavingProfile(true);
  try {
    await updateProfile({
      name: profileData.name,
      username: profileData.username,
      bio: profileData.bio,
    });
    await reloadProfile();

    alert("Profile updated successfully!");
  } catch (err) {
    alert(err.message || "Failed to update profile");
  } finally {
    setSavingProfile(false);
  }
};

    const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await updateNotifications({ newFeedback: notifications.newFeedback });
      alert("Notifications updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update notifications");
    } finally {
      setSavingNotifications(false);
    }
  };

const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type DELETE to confirm");
      return;
    }

    try {
      await requestDeletion(deletePassword);
      alert("Account deletion email sent! Please check your inbox.");
      setShowDeleteModal(false);
      resetDeletionState();
      setDeletePassword("");
      setDeleteConfirmText("");
    } catch (err) {
      alert(err.message || "Failed to request account deletion");
    }
  };


const displayImage = previewImage || (profile?.profilePicture?.startsWith("http")
  ? profile.profilePicture
  : profile?.profilePicture
  ? `${import.meta.env.VITE_API_BASE_URL}${profile.profilePicture}`
  : null);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
              {tabs.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{typeof icon === "string" ? icon : null}</span>

                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600 mt-1">Update your profile details</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                       {displayImage ? (
  <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-300">
    <User className="w-8 h-8 text-gray-500" />
  </div>
)}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full cursor-pointer hover:bg-gray-200">
                        <Images className="">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        /></Images>
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-500">JPG, PNG or WebP. Max 5MB.</p>
                      {previewImage && (
                        <p className="text-sm text-blue-500 mt-1">Preview ready - save to upload</p>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={profileData.name}
                      onChange={handleProfileChange("name")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      placeholder="Your username"
                      value={profileData.username}
                      onChange={handleProfileChange("username")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">Used in your profile URL</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      placeholder="Tell people about yourself..."
                      value={profileData.bio}
                      onChange={handleProfileChange("bio")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-end text-sm">
                      <span className="text-gray-500">{profileData.bio.length}/500</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your password</p>
                </div>

               
                  <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
  <h3 className="font-medium text-gray-900">Change Password</h3>

                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange("oldPassword")}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, old: !p.old }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">6+ chars with uppercase, lowercase, number</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                                     {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}

                      </button>
                    </div>
                  </div>

                   <button
    type="submit"
    disabled={passwordLoading}
    className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
  >
    {passwordLoading ? "Updating..." : "Update Password"}
  </button>
  </form>
                </div>
              
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Email notifications</h4>
                      <p className="text-sm text-gray-600">Get notified when someone sends a message</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.newFeedback}
                        onChange={(e) => setNotifications(prev => ({ ...prev, newFeedback: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                    className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {savingNotifications ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200">
                <div className="p-6 border-b border-red-200 bg-red-50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                  </div>
                  <p className="text-red-700 mt-1">Irreversible actions</p>
                </div>

                <div className="p-6">
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
                    <p className="text-gray-600 mb-4">This will permanently delete:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                      <li>Your profile and personal information</li>
                      <li>All your feedback walls</li>
                      <li>All feedback received and sent</li>
                      <li>All reactions and engagement data</li>
                    </ul>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
            </div>

            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deleteConfirmText !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
