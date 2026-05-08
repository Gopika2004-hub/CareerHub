import { useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Users, Settings,
  Building2, Lock, Mail, AlertTriangle, LogOut, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarLoader } from "react-spinners";
import { useState, useEffect } from "react";

const API = "/api";

const EmployerSettings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    hr_name: "",
    company_name: "",
    email: "",
    mobile: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);   // { type: "success"|"error", text }
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Load employer profile from backend on mount
  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    fetch(`${API}/employer-profile.php`, {
      headers: { Authorization: `Bearer ${user.id}` },
    })
      .then(r => r.json())
      .then(data => {
        setProfileData({
          hr_name:      data.hr_name      || user?.firstName || "",
          company_name: data.company_name || user?.unsafeMetadata?.company || "",
          email:        data.email        || user?.emailAddresses?.[0]?.emailAddress || "",
          mobile:       data.mobile       || user?.unsafeMetadata?.mobile || "",
        });
      })
      .catch(() => {
        // Fallback to Clerk data if backend fails
        setProfileData({
          hr_name:      user?.firstName || "",
          company_name: user?.unsafeMetadata?.company || "",
          email:        user?.emailAddresses?.[0]?.emailAddress || "",
          mobile:       user?.unsafeMetadata?.mobile || "",
        });
      })
      .finally(() => setLoadingProfile(false));
  }, [isLoaded, user?.id]);

  if (!isLoaded || loadingProfile) {
    return <BarLoader className="mb-4" width="100%" color="#36d7b7" />;
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${API}/employer-profile.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          hr_name:      profileData.hr_name,
          company_name: profileData.company_name,
          email:        profileData.email,
          mobile:       profileData.mobile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
      } else {
        setProfileMsg({ type: "error", text: "Failed to save. Please try again." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setSavingPassword(true);
    try {
      await user.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.errors?.[0]?.message || "Failed to update password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  const userFullName = profileData.hr_name || user?.firstName || "Employer";
  const companyName  = profileData.company_name || "Your Company";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0">
        <div className="p-8 flex flex-col items-center border-b border-slate-700">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
            {userFullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-semibold text-lg text-center">{userFullName}</h2>
          <p className="text-slate-400 text-sm text-center">{companyName}</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link to="/employer/dashboard" className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/my-jobs" className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Briefcase size={20} /> My Jobs
          </Link>
          <Link to="/applications" className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Users size={20} /> Applications
          </Link>
          <Link to="/employer/settings" className="flex items-center gap-3 p-3 bg-blue-600/20 text-blue-400 rounded-lg font-medium">
            <Settings size={20} /> Settings
          </Link>
          <button
            onClick={() => signOut(() => navigate("/"))}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-red-400 hover:text-white hover:bg-red-600/20 mt-2"
          >
            <LogOut size={20} /> Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-500">Manage your employer account preferences and details.</p>
        </header>

        <div className="max-w-3xl space-y-8 pb-12">

          {/* ── Company Profile ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b bg-slate-50">
              <Building2 className="text-blue-600" size={22} />
              <div>
                <h2 className="text-lg font-bold text-slate-800">Company Profile</h2>
                <p className="text-sm text-slate-500">Update your personal and company information</p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="hr_name">Contact Name</Label>
                  <Input
                    id="hr_name"
                    name="hr_name"
                    value={profileData.hr_name}
                    onChange={handleProfileChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleProfileChange}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="company@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={profileData.mobile}
                    onChange={handleProfileChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border
                  ${profileMsg.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"}`}>
                  {profileMsg.type === "success" && <CheckCircle size={16} />}
                  {profileMsg.text}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="blue" disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b bg-slate-50">
              <Lock className="text-blue-600" size={22} />
              <div>
                <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                <p className="text-sm text-slate-500">Keep your account secure with a strong password</p>
              </div>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              {passwordMsg && (
                <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border
                  ${passwordMsg.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"}`}>
                  {passwordMsg.type === "success" && <CheckCircle size={16} />}
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="blue" disabled={savingPassword}>
                  {savingPassword ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Email Display ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b bg-slate-50">
              <Mail className="text-blue-600" size={22} />
              <div>
                <h2 className="text-lg font-bold text-slate-800">Login Email</h2>
                <p className="text-sm text-slate-500">Your Clerk authentication email address</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-3">
                Your login email is managed by Clerk. To change it, please contact support.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700">
                {user?.emailAddresses?.[0]?.emailAddress || "—"}
              </div>
            </div>
          </div>

          {/* ── Delete Account ── */}
          <div className="bg-red-50/30 rounded-2xl shadow-sm border border-red-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-red-100 bg-red-50">
              <AlertTriangle className="text-red-600" size={22} />
              <div>
                <h2 className="text-lg font-bold text-red-700">Delete Account</h2>
                <p className="text-sm text-red-600/80">Permanently delete your employer account and all job postings</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Once you delete your account, there is no going back. All your posted jobs and applications will be permanently removed.
              </p>
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you absolutely sure? This cannot be undone.")) {
                    alert("Account deletion functionality to be implemented.");
                  }
                }}
              >
                Delete Employer Account
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EmployerSettings;
