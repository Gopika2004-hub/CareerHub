import CreatedApplications from "@/components/created-applications";
import CreatedJobs from "@/components/created-jobs";
import { useUser, useClerk } from "@/lib/auth";
import { BarLoader } from "react-spinners";
import CandidateSidebar from "@/components/candidate-sidebar";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { getProfile } from "@/api/apiProfile";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Users, Settings, LogOut,
} from "lucide-react";

const NAV = [
  ["/employer/dashboard", LayoutDashboard, "Dashboard"],
  ["/my-jobs",            Briefcase,       "My Jobs"],
  ["/applications",       Users,           "Applications"],
  ["/employer/settings",  Settings,        "Settings"],
];

const MyJobs = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: profile, fn: fetchProfile } = useFetch(getProfile);

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchProfile();
    }
  }, [isLoaded, user?.id]);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Candidate view
  if (user?.unsafeMetadata?.role === "candidate") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <CandidateSidebar customProfile={profile} />
        <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <CreatedApplications />
          </div>
        </main>
      </div>
    );
  }

  // Employer view â€” with sidebar
  const name    = user?.firstName || "Employer";
  const company = user?.unsafeMetadata?.company || "Your Company";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0">
        <div className="p-8 flex flex-col items-center border-b border-slate-700">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-semibold text-lg">{name}</h2>
          <p className="text-slate-400 text-sm">{company}</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {NAV.map(([to, Icon, label]) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                ${pathname === to
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
          <button
            onClick={() => signOut(() => navigate("/"))}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors w-full
                       text-red-400 hover:text-white hover:bg-red-600/20 mt-2"
          >
            <LogOut size={20} /> Log Out
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Jobs</h1>
          <p className="text-slate-500">Manage your job postings</p>
        </header>
        <CreatedJobs />
      </main>

    </div>
  );
};

export default MyJobs;
