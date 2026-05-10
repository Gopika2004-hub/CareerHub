import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, ClipboardList, Heart, FileText, LogOut, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@/lib/auth";
import useFetch from "@/hooks/use-fetch";
import { getProfile } from "@/api/apiProfile";

const CandidateSidebar = ({ customProfile }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [uploading, setUploading] = useState(false);

  const { data: fetchedProfile, fn: fetchProfile } = useFetch(getProfile);

  useEffect(() => {
    if (user?.id && !customProfile) {
      fetchProfile();
    }
  }, [user?.id, location.pathname]);

  const profile = customProfile || fetchedProfile;

  useEffect(() => {
    if (profile) {
      let completion = 0;
      if (profile.full_name) completion += 10;
      if (profile.email) completion += 10;
      if (profile.mobile) completion += 10;
      if (profile.dob) completion += 10;
      if (profile.location) completion += 10;
      if (profile.photo) completion += 10;
      if (profile.highest_qualification) completion += 15;
      if (profile.experience_type) completion += 10;
      if (profile.skills && profile.skills.length > 0) completion += 15;
      setProfileCompletion(completion);
    } else if (user) {
      let completion = 0;
      if (user.firstName) completion += 25;
      if (user.lastName) completion += 25;
      if (user.emailAddresses?.length > 0) completion += 25;
      if (user.unsafeMetadata?.phone || user.phoneNumbers?.length > 0) completion += 25;
      setProfileCompletion(completion);
    }
  }, [profile, user]);

  const userFullName = profile?.full_name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "User";

  let displayPhoto = user?.imageUrl || "/banner.jpeg";
  if (profile?.photo) {
    if (profile.photo instanceof File) {
      displayPhoto = URL.createObjectURL(profile.photo);
    } else {
      displayPhoto = profile.photo.startsWith('/') || profile.photo.startsWith('http')
        ? profile.photo
        : `/${profile.photo}`;
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}` },
        body: form,
      });
      const data = await res.json();
      if (data.success) fetchProfile();
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const currentPath = location.pathname;

  return (
    <aside className="w-full md:w-64 bg-[#213554] flex-shrink-0 flex flex-col items-center py-10 px-4">

      {/* Avatar with pencil edit */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full border-4 border-[#3A4F6C] overflow-hidden bg-[#c9efdf] flex items-center justify-center">
          <img
            src={displayPhoto}
            alt="User Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = '<span class="text-3xl">ðŸ»</span>';
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Update profile photo"
          className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-md transition-colors"
        >
          {uploading ? (
            <span className="text-[9px] px-0.5">...</span>
          ) : (
            <Pencil size={11} />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* User Name */}
      <h2 className="text-xl font-bold text-white mb-6 text-center">{userFullName}</h2>

      {/* Progress Bar */}
      <div className="w-full px-2 mb-10">
        <div className="w-full bg-[#3A4F6C] h-1.5 rounded-full mb-3">
          <div
            className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="text-center text-[13px] text-gray-300">
          {profileCompletion}% Profile Complete
        </p>
      </div>

      {/* Navigation */}
      <nav className="w-full flex flex-col gap-2">
        <Link
          to="/candidate/dashboard"
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
            currentPath === "/candidate/dashboard"
              ? "bg-[#496081] text-white font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-[#3A4F6C]"
          }`}
        >
          <Home className={`w-5 h-5 ${currentPath === "/candidate/dashboard" ? "text-yellow-200" : "text-gray-300"}`} />
          <span className="text-[15px]">Dashboard</span>
        </Link>

        <Link
          to="/profile"
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
            currentPath === "/profile"
              ? "bg-[#496081] text-white font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-[#3A4F6C]"
          }`}
        >
          <User className="w-5 h-5 text-[#3b82f6]" />
          <span className="text-[15px]">My Profile</span>
        </Link>

        <Link
          to="/my-jobs"
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
            currentPath === "/my-jobs"
              ? "bg-[#496081] text-white font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-[#3A4F6C]"
          }`}
        >
          <ClipboardList className="w-5 h-5 text-[#f97316]" />
          <span className="text-[15px]">Applied Jobs</span>
        </Link>

        <Link
          to="/saved-jobs"
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
            currentPath === "/saved-jobs"
              ? "bg-[#496081] text-white font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-[#3A4F6C]"
          }`}
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span className="text-[15px]">Saved Jobs</span>
        </Link>

        <Link
          to="/resume"
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
            currentPath === "/resume"
              ? "bg-[#496081] text-white font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-[#3A4F6C]"
          }`}
        >
          <FileText className={`w-5 h-5 ${currentPath === "/resume" ? "text-white" : "text-gray-300"}`} />
          <span className="text-[15px]">Resume</span>
        </Link>

        <button
          onClick={() => signOut(() => navigate("/"))}
          className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors text-red-400 hover:text-white hover:bg-red-600/30 mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[15px]">Log Out</span>
        </button>
      </nav>
    </aside>
  );
};

export default CandidateSidebar;
