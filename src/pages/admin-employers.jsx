import { useEffect, useState } from "react";
import { Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
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
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function ApplicantsModal({ job, onClose }) {
  const applicants = Array.isArray(job.applicants) ? job.applicants : [];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{job.job_title}</h2>
            <p className="text-slate-500 text-sm">{job.company_name} — {job.applicant_count} applicant{job.applicant_count !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {applicants.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs uppercase text-slate-500 font-bold">
                <tr>
                  {['Name','Email','Phone','Applied On','Status'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((app, i) => (
                  <tr key={app.id ?? i} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{app.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{app.email || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{app.phone || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{fmt(app.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                        ${STATUS_STYLE[app.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                        {app.status || 'applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400">No applicants for this job yet.</div>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose}
            className="bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteEmployerModal({ employer, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(employer.recruiter_id, reason.trim());
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
              <h2 className="font-bold text-slate-800">Delete Employer</h2>
              <p className="text-slate-500 text-xs">This will archive all their data permanently</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Deleting <span className="font-bold">{employer.company_name || employer.hr_name}</span> will remove
            all their jobs, applicants, and profile data. The record will be moved to Archives.
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason for Deletion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter the reason for deleting this employer…"
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

/* ── Main Page ── */
export default function AdminEmployers() {
  const navigate = useNavigate();
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null); // employer row to delete

  useEffect(() => {
    fetch("/api/admin/employers", { headers: H })
      .then(r => r.json())
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Delete a single job (existing)
  async function handleDeleteJob(job_id) {
    if (!job_id) return;
    if (!window.confirm("Delete this job and all its applications?")) return;
    const res  = await fetch(`/api/admin/employers?job_id=${job_id}`, { method: "DELETE", headers: H });
    const data = await res.json();
    if (data.success) setRows(r => r.filter(j => j.job_id !== job_id));
  }

  // Archive + delete entire employer
  async function handleDeleteEmployer(recruiter_id, reason) {
    const res = await fetch(`/api/admin/employer-full?recruiter_id=${recruiter_id}`, {
      method: "DELETE",
      headers: H,
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (data.success) {
      setRows(r => r.filter(j => j.recruiter_id !== recruiter_id));
      setDeleting(null);
    }
  }

  // Group rows by recruiter to show one delete-employer button per employer
  const seenRecruiters = new Set();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Employers</h1>
          <p className="text-slate-500 text-sm">
            All registered employers and their job postings — one row per job
          </p>
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs uppercase text-slate-500 font-bold tracking-wide">
                  <tr>
                    {["Company","Employer Name","Phone","Email","Job Posted","Posted Date","Application Close Date","Applicants","Actions"].map(h => (
                      <th key={h} className="px-4 py-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-14 text-center text-slate-400">
                        No employers registered yet.
                      </td>
                    </tr>
                  ) : rows.map((row, idx) => {
                    const isFirstForRecruiter = !seenRecruiters.has(row.recruiter_id);
                    if (row.recruiter_id) seenRecruiters.add(row.recruiter_id);

                    return (
                      <tr key={`${row.recruiter_id}-${row.job_id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-semibold text-slate-800">{row.company_name}</td>
                        <td className="px-4 py-4 text-slate-700">{row.hr_name || '—'}</td>
                        <td className="px-4 py-4 text-slate-600">{row.contact_phone}</td>
                        <td className="px-4 py-4 text-slate-600">{row.contact_email}</td>
                        <td className="px-4 py-4 text-slate-700">{row.job_title}</td>
                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{fmt(row.created_at)}</td>
                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{fmt(row.application_deadline)}</td>
                        <td className="px-4 py-4">
                          {row.applicant_count > 0 ? (
                            <button
                              onClick={() => setViewing(row)}
                              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                              {row.applicant_count} applied
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => navigate(`/admin/edit-job?job_id=${row.job_id}`)}
                              disabled={!row.job_id}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold
                                         bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg
                                         disabled:opacity-40 disabled:cursor-not-allowed">
                              <Pencil size={12} /> Edit
                            </button>
                            <button onClick={() => handleDeleteJob(row.job_id)}
                              disabled={!row.job_id}
                              title="Delete this job only"
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold
                                         bg-red-50 text-red-600 hover:bg-red-100 rounded-lg
                                         disabled:opacity-40 disabled:cursor-not-allowed">
                              <Trash2 size={12} /> Del Job
                            </button>
                            {isFirstForRecruiter && (
                              <button
                                onClick={() => setDeleting(row)}
                                title="Delete entire employer account"
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold
                                           bg-rose-700 text-white hover:bg-rose-800 rounded-lg">
                                <Trash2 size={12} /> Del Employer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-slate-500">
              {rows.length} record{rows.length !== 1 ? "s" : ""} total
            </div>
          </div>
        )}

        {viewing && <ApplicantsModal job={viewing} onClose={() => setViewing(null)} />}
        {deleting && (
          <DeleteEmployerModal
            employer={deleting}
            onConfirm={handleDeleteEmployer}
            onClose={() => setDeleting(null)}
          />
        )}
      </main>
    </div>
  );
}
