import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Archive, ShieldCheck, ShieldOff, ShieldX, Trash2 } from "lucide-react";
import { BarLoader } from "react-spinners";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";

const H = { Authorization: `Bearer ${ADMIN_TOKEN}` };

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CandidateArchiveRow({ record, onRestore, onPermanentlyBlock }) {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const profile = record.profile || {};
  const totalApps = (record.applications || []).length;
  const isPermanent = record.permanently_blocked === true;

  const handleRestore = async () => {
    if (!confirm(`Restore access for ${profile.full_name || 'this candidate'}? They will be able to log in again.`)) return;
    setActionLoading("restore");
    try {
      const res = await fetch("/api/admin/lift-access", {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: record.candidate_id, type: "candidate" }),
      });
      const data = await res.json();
      if (data.success) onRestore(record.candidate_id);
    } catch (e) {
      alert("Failed to restore access. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentlyBlock = async () => {
    if (!confirm(`Permanently block ${profile.full_name || 'this candidate'}? They will never be able to log in with this account.`)) return;
    setActionLoading("block");
    try {
      const res = await fetch("/api/admin/permanently-block", {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: record.candidate_id, type: "candidate" }),
      });
      const data = await res.json();
      if (data.success) onPermanentlyBlock(record.candidate_id);
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
            <p className="font-bold text-slate-800 truncate">{profile.full_name || '—'}</p>
            <p className="text-slate-500 text-xs">{profile.email || '—'} · {profile.mobile || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0 mr-4">
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

          {/* Profile info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              ["Full Name",   profile.full_name],
              ["Email",       profile.email],
              ["Mobile",      profile.mobile],
              ["Registered",  fmt(profile.created_at)],
              ["Archived On", fmt(record.archived_at)],
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

          {/* Applications */}
          {(record.applications || []).length > 0 ? (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Job Applications</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-slate-500 font-bold uppercase">
                    <tr>
                      {["Job ID","Status","Applied On"].map(h => (
                        <th key={h} className="px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {record.applications.map((app, i) => (
                      <tr key={app.id ?? i}>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{app.job_id || '—'}</td>
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
          ) : (
            <p className="text-sm text-slate-400 italic">No job applications on record.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminArchiveCandidates() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    fetch("/api/admin/archives?type=candidates", { headers: H })
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRestore = (candidateId) => {
    setRecords(prev => prev.filter(r => r.candidate_id !== candidateId));
    showToast("Access restored. The candidate can now log in again.");
  };

  const handlePermanentlyBlock = (candidateId) => {
    setRecords(prev => prev.map(r =>
      r.candidate_id === candidateId
        ? { ...r, permanently_blocked: true, permanently_blocked_at: new Date().toISOString() }
        : r
    ));
    showToast("Candidate has been permanently blocked.", "warning");
  };

  const handlePurgeEmpty = async () => {
    const empty = records.filter(r => !r.profile?.full_name?.trim() && !r.profile?.email?.trim());
    if (empty.length === 0) return showToast("No empty entries to remove.", "warning");
    if (!confirm(`Delete ${empty.length} archive entr${empty.length !== 1 ? "ies" : "y"} with no name or email?`)) return;
    try {
      const res = await fetch("/api/admin/purge-empty-archives?type=candidates", {
        method: "DELETE",
        headers: H,
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.filter(r => (r.profile?.full_name?.trim()) || (r.profile?.email?.trim())));
        showToast(`Removed ${data.removed} empty archive entr${data.removed !== 1 ? "ies" : "y"}.`);
      }
    } catch {
      alert("Failed to purge empty archives.");
    }
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.profile?.full_name?.toLowerCase().includes(q) ||
      r.profile?.email?.toLowerCase().includes(q) ||
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
              <Archive size={22} className="text-rose-500" /> Archived Candidates
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {records.length} candidate{records.length !== 1 ? "s" : ""} archived — click a row to expand details and manage access
            </p>
          </div>
          <div className="flex items-center gap-3">
            {records.some(r => !r.profile?.full_name?.trim() && !r.profile?.email?.trim()) && (
              <button
                onClick={handlePurgeEmpty}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Trash2 size={15} /> Clean Empty
              </button>
            )}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or reason…"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-slate-400">
            {search ? "No matching archived candidates." : "No candidates have been archived yet."}
          </div>
        ) : (
          <div>
            {filtered.map((record, i) => (
              <CandidateArchiveRow
                key={record.candidate_id ?? i}
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
