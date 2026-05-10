import { useEffect, useState } from "react";
import { useUser, useClerk } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Users, Settings, LogOut,
  Mail, Phone, Clock, IndianRupee, Download,
} from "lucide-react";
import { BarLoader } from "react-spinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = "/api";

function StatusBadge({ status }) {
  const s = (status || "applied").toLowerCase();
  const cls =
    s === "shortlisted" ? "bg-[#1f883d] text-white"
    : s === "rejected"   ? "bg-red-600 text-white"
    :                      "bg-[#0a66c2] text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {status || "applied"}
    </span>
  );
}

function ApplicationRow({ app, uid, onStatusChange }) {
  const [sel, setSel]         = useState(app.status || "applied");
  const [cur, setCur]         = useState(app.status || "applied");
  const [updating, setUpdating] = useState(false);

  async function handleUpdate() {
    if (sel === cur || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/applications.php?id=${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
        body: JSON.stringify({ status: sel }),
      });
      if (!res.ok) throw new Error("Update failed");
      setCur(sel);
      onStatusChange();
    } catch (e) {
      console.error(e);
    }
    setUpdating(false);
  }

  return (
    <tr className="hover:bg-slate-50/40 transition-colors align-middle">

      {/* CANDIDATE */}
      <td className="px-5 py-4 border border-slate-200 min-w-[220px]">
        <p className="font-bold text-[#1e293b] text-[15px] mb-2">{app.name || "â€”"}</p>
        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1.5">
          <Mail size={14} className="shrink-0 text-slate-400" />
          <span>{app.email || "â€”"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1.5">
          <Phone size={14} className="shrink-0 text-slate-400" />
          <span>{app.phone || "â€”"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-1.5">
          <Clock size={14} className="shrink-0 text-slate-400" />
          <span>Available: {app.availability || "â€”"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
          <IndianRupee size={14} className="shrink-0 text-slate-400" />
          <span>
            {app.expected_salary
              ? `Expected: â‚¹${Number(app.expected_salary).toLocaleString("en-IN")}/mo`
              : "Expected: â€”"}
          </span>
        </div>
      </td>

      {/* JOB APPLIED */}
      <td className="px-5 py-4 border border-slate-200 font-medium text-slate-700">
        {app.job_title || "â€”"}
      </td>

      {/* APPLIED ON */}
      <td className="px-5 py-4 border border-slate-200 text-sm text-slate-600 whitespace-nowrap">
        {app.created_at
          ? new Date(app.created_at).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })
          : "â€”"}
      </td>

      {/* RESUME */}
      <td className="px-5 py-4 border border-slate-200">
        {app.resume_name ? (
          <a
            href={`/uploads/${app.resume_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200
                       text-[#0a66c2] text-[13px] font-bold rounded-md hover:bg-slate-50
                       transition-colors shadow-sm"
          >
            <Download size={14} strokeWidth={2.5} /> Resume
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">Not uploaded</span>
        )}
      </td>

      {/* STATUS */}
      <td className="px-5 py-4 border border-slate-200">
        <StatusBadge status={cur} />
      </td>

      {/* UPDATE */}
      <td className="px-5 py-4 border border-slate-200">
        <div className="flex items-center gap-2">
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-1.5 text-[13px] bg-white
                       text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300
                       min-w-[110px] shadow-sm"
          >
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleUpdate}
            disabled={updating || sel === cur}
            className="bg-[#1e293b] hover:bg-slate-800 disabled:opacity-50 text-white
                       text-[13px] font-semibold px-3 py-1.5 rounded-md transition-colors
                       whitespace-nowrap shadow-sm"
          >
            {updating ? "Savingâ€¦" : "âœ“ Update"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ApplicationsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [apps, setApps]             = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedJob, setSelectedJob] = useState("all");
  const [search, setSearch]         = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const uid = user?.id || "test-user-123";
  const name    = user?.firstName || "Employer";
  const company = user?.unsafeMetadata?.company || "Your Company";

  async function loadData() {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch(`${API}/applications.php?recruiter_id=${encodeURIComponent(uid)}`, {
          headers: { Authorization: `Bearer ${uid}` },
        }),
        fetch(`${API}/jobs.php?recruiter_id=${encodeURIComponent(uid)}`, {
          headers: { Authorization: `Bearer ${uid}` },
        }),
      ]);
      const appsData = await appsRes.json();
      const jobsData = await jobsRes.json();
      setApps(Array.isArray(appsData) ? appsData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (e) {
      console.error("Failed to load applications:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isLoaded) loadData();
  }, [isLoaded]); // eslint-disable-line

  const navLinks = [
    ["/employer/dashboard", LayoutDashboard, "Dashboard"],
    ["/my-jobs",            Briefcase,       "My Jobs"],
    ["/applications",       Users,           "Applications"],
    ["/employer/settings",  Settings,        "Settings"],
  ];

  const filtered = apps.filter((a) => {
    const jobMatch = selectedJob === "all" || String(a.job_id) === String(selectedJob);
    const nameMatch = !filterSearch || (a.name || "").toLowerCase().includes(filterSearch.toLowerCase());
    return jobMatch && nameMatch;
  });

  if (!isLoaded) return <BarLoader width="100%" color="#36d7b7" />;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0">
        <div className="p-8 flex flex-col items-center border-b border-slate-700">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center
                          text-2xl font-bold mb-3">
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-semibold text-lg">{name}</h2>
          <p className="text-slate-400 text-sm">{company}</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navLinks.map(([to, Icon, label]) => (
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

      {/* â”€â”€ Main â”€â”€ */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Job Applications</h1>
          <p className="text-slate-500">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</p>
        </header>

        {/* Filter bar */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            {/* Job filter */}
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm
                         text-slate-700 bg-white focus:outline-none focus:ring-2
                         focus:ring-slate-300 shadow-sm"
            >
              <option value="all">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>

            {/* Candidate name search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name..."
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm
                         text-slate-700 bg-white focus:outline-none focus:ring-2
                         focus:ring-slate-300 shadow-sm"
            />

            {/* Filter button */}
            <button
              onClick={() => setFilterSearch(search)}
              className="bg-[#1e293b] hover:bg-slate-800 text-white font-semibold
                         px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
            >
              Filter
            </button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8"><BarLoader width="100%" color="#36d7b7" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead className="bg-[#f8f9fa] text-[13px] uppercase text-slate-500
                                    font-bold tracking-wide border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 border-r border-slate-200">Candidate</th>
                      <th className="px-5 py-4 border-r border-slate-200">Job Applied</th>
                      <th className="px-5 py-4 border-r border-slate-200">Applied On</th>
                      <th className="px-5 py-4 border-r border-slate-200">Resume</th>
                      <th className="px-5 py-4 border-r border-slate-200">Status</th>
                      <th className="px-5 py-4">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((app) => (
                        <ApplicationRow
                          key={app.id}
                          app={app}
                          uid={uid}
                          onStatusChange={loadData}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Users size={36} className="opacity-30" />
                            <p className="font-semibold text-slate-500">No applications found</p>
                            <p className="text-sm">Try changing the filters above.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
