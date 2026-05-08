import { useEffect, useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { BarLoader } from "react-spinners";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";

const H = {
  Authorization: `Bearer ${ADMIN_TOKEN}`,
  "Content-Type": "application/json",
};

const STATUS_STYLE = {
  applied:     "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  accepted:    "bg-green-100 text-green-700",
  rejected:    "bg-red-100 text-red-600",
  registered:  "bg-gray-100 text-gray-600",
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DeleteCandidateModal({ candidate, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(candidate.candidate_id, reason.trim());
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Delete Candidate</h2>
              <p className="text-slate-500 text-xs">This will archive all their data permanently</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Deleting <span className="font-bold">{candidate.name}</span> will remove their profile
            and all job applications. The record will be moved to Archives.
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason for Deletion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter the reason for deleting this candidate…"
              rows={3}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!reason.trim() || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? "Deleting…" : "Delete & Archive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCandidates() {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetch("/api/admin/candidates.php", { headers: H })
      .then(r => r.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteCandidate(candidate_id, reason) {
    const res = await fetch(`/api/admin/candidate-full.php?candidate_id=${candidate_id}`, {
      method: "DELETE",
      headers: H,
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (data.success) {
      setRows(r => r.filter(c => c.candidate_id !== candidate_id));
      setDeleting(null);
    }
  }

  const filtered = rows.filter(r =>
    !search ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
            <p className="text-slate-500 text-sm">All registered candidates and their job applications</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or company…"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 bg-white
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs uppercase text-slate-500 font-bold tracking-wide">
                  <tr>
                    {["#","Name","Email","Phone","Company","Applied Job","Applied Date","Status","Actions"].map(h => (
                      <th key={h} className="px-5 py-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-14 text-center text-slate-400">
                        No candidates found.
                      </td>
                    </tr>
                  ) : filtered.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-5 py-4 text-slate-600">{c.email}</td>
                      <td className="px-5 py-4 text-slate-600">{c.phone}</td>
                      <td className="px-5 py-4 text-slate-700">{c.company_name}</td>
                      <td className="px-5 py-4 text-slate-700">{c.job_title}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{fmt(c.applied_date)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                          ${STATUS_STYLE[c.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                          {c.status || "applied"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleting(c)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
                                     bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-slate-500">
              Showing {filtered.length} of {rows.length} record{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {deleting && (
          <DeleteCandidateModal
            candidate={deleting}
            onConfirm={handleDeleteCandidate}
            onClose={() => setDeleting(null)}
          />
        )}
      </main>
    </div>
  );
}
