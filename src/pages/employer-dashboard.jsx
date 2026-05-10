import { useUser, useClerk } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Users, Settings, LogOut,
  Plus, Pencil, Trash2, ChevronRight, ClipboardList,
  Mail, Phone, Clock, IndianRupee, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import { getMyJobs, deleteJob } from "@/api/apiJobs";

const API = "/api";

/* â”€â”€â”€ Status pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatusBadge({ status }) {
  const s = (status || "applied").toLowerCase();
  const cls =
    s === "shortlisted" ? "bg-[#1f883d] text-white"
      : s === "rejected" ? "bg-red-600 text-white"
        : "bg-[#0a66c2] text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {status || "applied"}
    </span>
  );
}

/* â”€â”€â”€ One application row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ApplicationRow({ app, uid, onDelete }) {
  const [sel, setSel] = useState(app.status || "applied");
  const [cur, setCur] = useState(app.status || "applied");
  const [updating, setUpdating] = useState(false);

  /* â”€â”€ update status â”€â”€ */
  async function handleUpdate() {
    if (sel === cur || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/applications.php?id=${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify({ status: sel }),
      });
      if (!res.ok) throw new Error("Update failed");
      setCur(sel);
    } catch (e) {
      console.error("Update failed:", e);
    }
    setUpdating(false);
  }

  /* â”€â”€ delete â€” tell parent; parent removes from state immediately â”€â”€ */
  function handleDelete() {
    onDelete(app.id);
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
      <td className="px-5 py-4 border border-slate-200 font-medium text-slate-700">{app.job_title || "â€”"}</td>

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
        {app.resume_name
          ? (
            <a
              href={`/uploads/${app.resume_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-[#0a66c2] text-[13px] font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={14} strokeWidth={2.5} /> Resume
            </a>
          )
          : <span className="text-xs text-slate-400 italic">Not uploaded</span>}
      </td>

      {/* STATUS */}
      <td className="px-5 py-4 border border-slate-200">
        <StatusBadge status={cur} />
      </td>

      {/* UPDATE */}
      <td className="px-5 py-4 border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sel}
            onChange={e => setSel(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-1.5 text-[13px] bg-white
                       text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[110px] shadow-sm"
          >
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={handleUpdate}
            disabled={updating || sel === cur}
            className="bg-[#1e293b] hover:bg-slate-800 disabled:opacity-50
                       text-white text-[13px] font-semibold px-3 py-1.5 rounded-md
                       transition-colors whitespace-nowrap shadow-sm"
          >
            {updating ? "Savingâ€¦" : "âœ“ Update"}
          </button>

          <button
            onClick={handleDelete}
            title="Delete application"
            className="p-1.5 rounded-md border border-red-200 text-red-500
                       hover:bg-red-50 hover:text-red-600 transition-colors bg-white shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* â”€â”€â”€ Employer Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function EmployerDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* jobs via useFetch */
  const { data: jobs, fn: fnJobs, loading: loadingJobs } = useFetch(
    getMyJobs, { recruiter_id: user?.id }
  );
  const { fn: fnDeleteJob } = useFetch(deleteJob);

  /* employer avatar */
  const empPhotoRef = useRef(null);
  const [empPhoto, setEmpPhoto] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  /* applications â€” fetched directly so recruiter_id is always current */
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const getUid = () => user?.id || "test-user-123";

  async function loadApps() {
    const uid = getUid();
    setLoadingApps(true);
    try {
      const res = await fetch(
        `${API}/applications.php?recruiter_id=${encodeURIComponent(uid)}`,
        { headers: { Authorization: `Bearer ${uid}` } }
      );
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("loadApps failed:", e);
    }
    setLoadingApps(false);
  }

  /* â”€â”€ delete: remove from UI immediately, then hit API â”€â”€ */
  async function handleDeleteApp(appId) {
    /* 1. Remove from local state right away â€” UI updates instantly */
    setApps(prev => prev.filter(a => a.id !== appId));

    /* 2. Call the server in the background */
    try {
      const uid = getUid();
      const res = await fetch(`${API}/applications.php?id=${appId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${uid}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      console.log("DELETE result:", data);
    } catch (e) {
      /* Network error â€” restore list from server */
      console.error("DELETE failed, restoring:", e);
      loadApps();
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      fnJobs();
      loadApps();
      fetch(`${API}/employer-profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.id}` },
        body: JSON.stringify({
          hr_name:      user.firstName || '',
          company_name: user.unsafeMetadata?.company || '',
          email:        user.emailAddresses?.[0]?.emailAddress || '',
          mobile:       user.unsafeMetadata?.mobile || '',
        }),
      }).catch(() => {});
      fetch(`${API}/employer-avatar.php`, { headers: { Authorization: `Bearer ${user.id}` } })
        .then(r => r.json())
        .then(d => { if (d.photo) setEmpPhoto(d.photo); })
        .catch(() => {});
    }
  }, [isLoaded, user?.id]); // eslint-disable-line

  async function handleEmpPhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${API}/employer-avatar.php`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}` },
        body: form,
      });
      const data = await res.json();
      if (data.photo) setEmpPhoto(data.photo);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setPhotoUploading(false);
      if (empPhotoRef.current) empPhotoRef.current.value = "";
    }
  }

  async function handleDeleteJob(id) {
    if (window.confirm("Delete this job posting?")) {
      await fnDeleteJob({ job_id: id });
      fnJobs();
    }
  }

  if (!isLoaded || loadingJobs) return <BarLoader width="100%" color="#36d7b7" />;

  const name = user?.firstName || "Employer";
  const company = user?.unsafeMetadata?.company || "Your Company";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col">
        <div className="p-8 flex flex-col items-center border-b border-slate-700">
          {/* Avatar with pencil */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-2xl font-bold">
              {empPhoto ? (
                <img src={empPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => empPhotoRef.current?.click()}
              title="Update profile photo"
              className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 rounded-full p-1 shadow-md transition-colors"
            >
              {photoUploading ? (
                <span className="text-[8px] text-orange-500 px-0.5">...</span>
              ) : (
                <Pencil size={11} className="text-orange-500" />
              )}
            </button>
            <input
              ref={empPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleEmpPhotoUpload}
            />
          </div>
          <h2 className="font-semibold text-lg">{name}</h2>
          <p className="text-slate-400 text-sm">{company}</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {[
            ["/employer/dashboard", LayoutDashboard, "Dashboard"],
            ["/my-jobs",            Briefcase,       "My Jobs"],
            ["/applications",       Users,           "Applications"],
            ["/employer/settings",  Settings,        "Settings"],
          ].map(([to, Icon, label]) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                ${pathname === to
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Icon size={20} /> {label}
            </Link>
          ))}
          <button
            onClick={() => signOut(() => navigate("/"))}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-red-400 hover:text-white hover:bg-red-600/20 mt-2"
          >
            <LogOut size={20} /> Log Out
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Welcome, {name}! ðŸ‘‹
          </h1>
          <p className="text-slate-500">{company} â€” Employer Dashboard</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { n: jobs?.length || 0, label: "Active Jobs", color: "orange", Icon: Briefcase },
            { n: apps.length, label: "Total Applications", color: "green", Icon: ClipboardList },
          ].map(({ n, label, color, Icon }) => (
            <Card key={label} className="border-none shadow-sm overflow-hidden relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}-500`} />
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                  <Icon className={`text-${color}-600`} size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{n}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Post Job Banner */}
        <div className="bg-[#1e3a8a] text-white p-6 rounded-xl flex items-center
                        justify-between mb-10 shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-1">Post a New Job</h3>
            <p className="text-blue-100 opacity-80">Reach thousands of qualified candidates.</p>
          </div>
          <Button onClick={() => navigate("/post-job")}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6">
            <Plus className="mr-2" size={18} /> Post New Job
          </Button>
        </div>

        {/* Recent Job Postings */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
            <CardTitle className="text-lg font-bold">Recent Job Postings</CardTitle>
            <Link to="/my-jobs"
              className="text-blue-600 text-sm font-semibold flex items-center hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Posted</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs?.length > 0 ? jobs.slice(0, 3).map(job => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{job.title}</td>
                    <td className="px-6 py-4 text-slate-600">{job.location}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button variant="ghost" size="sm"
                        className="text-blue-600 p-0 h-auto"
                        onClick={() => navigate(`/post-job?edit=${job.id}`)}>
                        <Pencil size={16} className="mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm"
                        className="text-red-600 p-0 h-auto"
                        onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 size={16} className="mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No jobs posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border-none shadow-sm">
          <CardHeader className="py-4 border-b">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-bold">Recent Applications</CardTitle>
              {apps.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold
                                 px-2.5 py-0.5 rounded-full">
                  {apps.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingApps
              ? <div className="p-8"><BarLoader width="100%" color="#36d7b7" /></div>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200">
                    <thead className="bg-[#f8f9fa] text-[13px] uppercase text-slate-500
                                      font-bold tracking-wide border-b border-t border-slate-200">
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
                      {apps.length > 0
                        ? apps.map(app => (
                          <ApplicationRow
                            key={app.id}
                            app={app}
                            uid={getUid()}
                            onDelete={handleDeleteApp}
                          />
                        ))
                        : (
                          <tr>
                            <td colSpan="6" className="px-6 py-14 text-center">
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <ClipboardList size={36} className="opacity-30" />
                                <p className="font-semibold text-slate-500">No applications yet</p>
                                <p className="text-sm">
                                  Applications will appear here once candidates apply.
                                </p>
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