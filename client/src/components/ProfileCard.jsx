import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { FaCheckCircle, FaEdit, FaShareAlt } from "react-icons/fa";

const ProfileCard = () => {
  const { profile, loading, updateProfile, isOperationPending } = useUser();
  const { user } = useAuth();

  const userName = profile?.name || user?.name || "User";
  const sharedLink =
    profile?.profileUrl ||
    profile?.dashboardLink ||
    user?.profileLink ||
    (user?.username
      ? `${window.location.origin}/${user.username}`
      : window.location.origin);

  // Memoize avatar URL calculation to prevent unnecessary recalculations
  const avatarUrl = useMemo(() => {
    if (profile?.avatarUrl) {
      return profile.avatarUrl;
    } else if (profile?.profilePicture) {
      return profile.profilePicture.startsWith("http")
        ? profile.profilePicture
        : `${import.meta.env.VITE_API_BASE_URL}${profile.profilePicture}`;
    } else {
      return user?.avatarUrl || null;
    }
  }, [profile?.avatarUrl, profile?.profilePicture, user?.avatarUrl]);

  const isVerified = profile?.isVerified || false;
  const userBio = profile?.bio || "";

  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(userBio);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setTempBio(userBio);
  }, [userBio]);

  const hasBio = !!tempBio;

  const handleSaveBio = useCallback(async () => {
    if (tempBio === userBio) {
      setIsEditing(false);
      return;
    }

    const result = await updateProfile({ bio: tempBio });
    if (result) setIsEditing(false);
  }, [tempBio, userBio, updateProfile]);

  const handleShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sharedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [sharedLink]);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white shadow-xl rounded-xl p-6 flex flex-col items-center space-y-4 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-gray-200"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white shadow-xl rounded-xl p-6 flex flex-col items-center space-y-4">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-purple-200 flex items-center justify-center border-4 border-white shadow-md text-purple-600 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${userName}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold">
              {userName[0]?.toUpperCase()}
            </span>
          )}
        </div>
          
        {/* Name & Verified Badge */}
        <div className="flex items-center space-x-2">
          <h3 className="text-2xl text-gray-800 font-bold">{userName}</h3>
          {isVerified && <FaCheckCircle className="h-5 w-5 text-blue-500" />}
        </div>

        {/* Bio Section */}
        <div className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            {isEditing ? (
              <textarea
                className="w-full bg-white p-2 border rounded resize-none text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                rows={3}
                placeholder="Type your bio here..."
                disabled={isOperationPending}
              />
            ) : (
              <p
                className={`text-sm ${
                  hasBio ? "text-gray-700" : "text-red-700 italic"
                }`}
              >
                {hasBio
                  ? tempBio
                  : "Your profile bio is missing. Click the edit icon to add one!"}
              </p>
            )}
            <button
              onClick={() => (isEditing ? handleSaveBio() : setIsEditing(true))}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
              aria-label={isEditing ? "Save bio" : "Edit bio"}
              disabled={isOperationPending}
            >
              {isEditing ? (
                <svg
                  className={`h-4 w-4 ${
                    isOperationPending
                      ? "animate-spin text-blue-400"
                      : "text-green-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              ) : (
                <FaEdit className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Share Link */}
        <button
          onClick={handleShareLink}
          className="w-full text-center py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition duration-200 shadow-sm"
        >
          <FaShareAlt className="h-4 w-4" />
          <span className="truncate">
            {copySuccess ? "Link copied!" : sharedLink}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;