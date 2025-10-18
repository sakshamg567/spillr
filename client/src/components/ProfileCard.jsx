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
      <div className="p-2">
        <div className="w-full bg-white border border-black shadow-[4px_4px_0_0_#000] rounded-none p-4 animate-pulse"style={{ fontFamily: "Space Grotesk" }}>
          <div className="h-40 w-full bg-gray-200 rounded-none mb-3"></div>
          <div className="h-5 w-3/4 mx-auto bg-gray-200 rounded-none mb-2"></div>
          <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded-none"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-2 border-black  ">
     
<div className="flex items-center justify-center w-56 h-56 bg-gray-100 overflow-hidden mx-auto rounded-md border border-black mt-4">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt={`${userName}'s avatar`}
      className="object-cover w-full h-full "
      loading="lazy"
    />
  ) : (
    <span className="text-4xl font-bold text-gray-700">
      {userName[0]?.toUpperCase()}
    </span>
  )}
</div>


      {/* Card Body — ALL CENTERED */}
      <div className="p-3 space-y-3 text-center">
        <div className="flex items-center justify-center gap-1"> 
          <h3 className="font-bold text-base text-gray-900"style={{ fontFamily: "Space Grotesk" }}>
            {userName}
          </h3>
          {isVerified && <FaCheckCircle className="h-4 w-4 text-blue-500" />}
        </div>
        {/* Centered action buttons */}
        <div className="pt-2 border-t border-gray-200 flex flex-row justify-center gap-4">
  
  <button
    onClick={handleShareLink}
    className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 hover:text-black"
  >
    <FaShareAlt className="h-4 w-4 text-black" style={{ fontFamily: "Space Grotesk" }} / >
    {copySuccess ? "Copied!" : "Share"}
  </button>
</div>

      </div>
    </div>
  );
};

export default ProfileCard;