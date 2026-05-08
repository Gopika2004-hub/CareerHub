import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Archive, ShieldCheck, ShieldOff, ShieldX } from "lucide-react";
import { BarLoader } from "react-spinners";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";

const H = { Authorization: `Bearer ${ADMIN_TOKEN}` };

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function EmployerArchiveRow({ record, onRestore, onPermanentlyBlock }) {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const info = record.employer_info || {};
  const totalJobs = (record.jobs || []).length;
  const totalApps = (record.applications || []).length;
  const isPermanent = record.permanently_blocked === true;

  const handleRestore = async () => {
    if (!confirm(`Restore access for ${info.company_name || 'this employer'}? They will be able to log in again.`)) return;
    setActionLoading("restore");
    try {
      const res = await fetch("/api/admin/lift-access.php", {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: record.recruiter_id, type: "employer" }),
      });
      const data = await res.json();
      if (data.success) onRestore(record.recruiter_id);
    } catch (e) {
      alert("Failed to restore access. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentlyBlock = async () => {
    if (!confirm(`Permanently block ${info.company_name || 'this employer'}? They will never be able to log in with this account.`)) return;
    setActionLoading("block");
    try {
      const res = await fetch("/api/admin/permanently-block.php", {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: record.recruiter_id, type: "employer" }),
      });
      const data = await res.json();
      if (data.success) onPermanentlyBlock(record.recruiter_id);
    } catch (e) {
      alert("Failed to permanently block. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Archive size={16} className="text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{info.company_name || '—'}</p>
            <p className="text-slate-500 text-xs">{info.hr_name || '—'} · {info.email || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0 mr-4">
          <span>{totalJobs} job{totalJobs !== 1 ? "s" : ""}</span>
          <span>{totalApps} application{totalApps !== 1 ? "s" : ""}</span>
          {isPermanent ? (
            <span className="flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full">
              <ShieldX size={11} /> Permanently Blocked
            </span>
          ) : (
            <span className="text-rose-600 font-medium">Archived {fmt(record.archived_at)}</span>
          )}
        </div>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-slate-50 px-5 py-4 space-y-4">
          {/* Reason */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Reason for Suspension</p>
            <p className="text-sm text-amber-900">{record.reason || '—'}</p>
          </div>

          {/* Employer info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              ["Company",    info.company_name],
              ["HR Name",    info.hr_name],
              ["Email",      info.email],
              ["Phone",      info.mobile],
              ["Registered", fmt(info.created_at)],
              ["Archived",   fmt(record.archived_at)],
            ].map(([label, val]) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{label}</p>
                <p className="text-slate-700 font-medium truncate">{val || '—'}</p>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="flex items-center gap-3 pt-1">
            {!isPermanent && (
              <button
                onClick={handleRestore}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
              >
                <ShieldCheck size={15} />
                {actionLoading === "restore" ? "Restoring…" : "Lift Access"}
              </button>
            )}
            {!isPermanent && (
              <button
                onClick={handlePermanentlyBlock}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-red-700 hover:bg-red-800 text-white disabled:opacity-50 transition-colors"
              >
                <ShieldOff size={15} />
                {actionLoading === "block" ? "Blocking…" : "Permanently Block"}
              </button>
            )}
            {isPermanent && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-700 border border-red-200">
                <ShieldX size={15} />
                Permanently Blocked on {fmt(record.permanently_blocked_at)}
              </div>
            )}
          </div>

          {/* Jobs */}
          {(record.jobs || []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Jobs Posted</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-slate-500 font-bold uppercase">
                    <tr>
                      {["Job Title","Location","Type","Salary","Posted"].map(h => (
                        <th key={h} className="px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {record.jobs.map((job, i) => (
                      <tr key={job.id ?? i}>
                        <td className="px-4 py-2.5 font-medium text-slate-700">{job.title || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{job.location || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{job.job_type || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{job.salary_range || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{fmt(job.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications */}
          {(record.applications || []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Applications</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-slate-500 font-bold uppercase">
                    <tr>
                      {["Candidate","Email","Status","Applied On"].map(h => (
                        <th key={h} className="px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {record.applications.map((app, i) => (
                      <tr key={app.id ?? i}>
                        <td className="px-4 py-2.5 font-medium text-slate-700">{app.name || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{app.email || '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                            {app.status || 'applied'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{fmt(app.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminArchiveEmployers() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    fetch("/api/admin/archives.php?type=employers", { headers: H })
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRestore = (recruiterId) => {
    setRecords(prev => prev.filter(r => r.recruiter_id !== recruiterId));
    showToast("Access restored. The employer can now log in again.");
  };

  const handlePermanentlyBlock = (recruiterId) => {
    setRecords(prev => prev.map(r =>
      r.recruiter_id === recruiterId
        ? { ...r, permanently_blocked: true, permanently_blocked_at: new Date().toISOString() }
        : r
    ));
    showToast("Employer has been permanently blocked.", "warning");
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.employer_info?.company_name?.toLowerCase().includes(q) ||
      r.employer_info?.hr_name?.toLowerCase().includes(q) ||
      r.employer_info?.email?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
            ${toast.type === "warning" ? "bg-red-700 text-white" : "bg-emerald-600 text-white"}`}>
            {toast.msg}
          </div>
        )}
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Archive size={22} className="text-rose-500" /> Archived Employers
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {records.length} employer{records.length !== 1 ? "s" : ""} archived — click a row to expand details and manage access
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, name or reason…"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 bg-white
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-slate-400">
            {search ? "No matching archived employers." : "No employers have been archived yet."}
          </div>
        ) : (
          <div>
            {filtered.map((record, i) => (
              <EmployerArchiveRow
                key={record.recruiter_id ?? i}
                record={record}
                onRestore={handleRestore}
                onPermanentlyBlock={handlePermanentlyBlock}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
