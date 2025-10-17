import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { FaCheckCircle, FaEdit, FaShareAlt } from "react-icons/fa";

const ProfileCard = () => {
  const { profile, loading, updateProfile, isOperationPending } = useUser();
  const { user } = useAuth();

  const userName = profile?.name || user?.name || "User";

  const sharedLink = useMemo(() => {
    const username = profile?.username || user?.username;
    return username
      ? `${window.location.origin}/public/wall/${username}`
      : window.location.origin;
  }, [profile?.username, user?.username]);

  const avatarUrl = useMemo(() => {
    if (profile?.avatarUrl) return profile.avatarUrl;
    if (profile?.profilePicture)
      return profile.profilePicture.startsWith("http")
        ? profile.profilePicture
        : `${import.meta.env.VITE_API_BASE_URL}${profile.profilePicture}`;
    return user?.avatarUrl || null;
  }, [profile?.avatarUrl, profile?.profilePicture, user?.avatarUrl]);

  const isVerified = profile?.isVerified || false;
  const userBio = profile?.bio || "";

  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(userBio);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setTempBio(userBio);
  }, [userBio]);

  const handleSaveBio = useCallback(async () => {
    if (tempBio === userBio) return setIsEditing(false);
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
        <div className="w-full max-w-sm bg-white border border-black shadow-[3px_3px_0_#000] rounded-xl p-6 animate-pulse">
          <div className="h-40 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-70 border bg-card text-card-foreground shadow-elegant border-1 shadow-card  shadow-[4px_4px_0_0_#000] ">
      {/* Avatar */}
      <div className="w-full h-48 bg-purple-100 flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-purple-600">
            {userName[0]?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Name Row */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900 truncate">
            {userName}
          </h3>
          {isVerified && <FaCheckCircle className="h-5 w-5 text-blue-500" />}
        </div>

        {/* Bio */}
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-0 focus:border-black"
            rows={2}
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            disabled={isOperationPending}
          />
        ) : (
          <p
            className={`text-sm ${
              tempBio ? "text-gray-700" : "text-gray-400 italic"
            }`}
          >
            {tempBio || "No bio yet. Click edit to add one."}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <button
            onClick={() => (isEditing ? handleSaveBio() : setIsEditing(true))}
            className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-black transition"
            disabled={isOperationPending}
          >
            <FaEdit className="h-4 w-4" />
            {isEditing ? "Save" : "Edit"}
          </button>

          <button
            onClick={handleShareLink}
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition"
          >
            <FaShareAlt className="h-4 w-4" />
            {copySuccess ? "Copied!" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
