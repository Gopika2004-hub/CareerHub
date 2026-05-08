import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { BarLoader } from "react-spinners";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";

const H = { Authorization: `Bearer ${ADMIN_TOKEN}` };

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

/* ── Applicants Modal ── */
function ApplicantsModal({ job, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{job.job_title}</h2>
            <p className="text-slate-500 text-sm">{job.company_name} — {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {job.applicants?.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-xs uppercase text-slate-500 font-bold">
                <tr>
                  {["Name","Email","Phone","Applied On","Status"].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {job.applicants.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{a.name || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{a.email || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{a.phone || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{fmt(a.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                        ${STATUS_STYLE[a.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                        {a.status || "applied"}
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

/* ── Main Page ── */
export default function AdminApplications() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    fetch("/api/admin/applications.php", { headers: H })
      .then(r => r.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(job_id) {
    if (!window.confirm("Delete this job posting and all its applications?")) return;
    const res  = await fetch(`/api/admin/applications.php?job_id=${job_id}`, {
      method: "DELETE",
      headers: H,
    });
    const data = await res.json();
    if (data.success) setRows(r => r.filter(j => j.job_id !== job_id));
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 text-sm">All job postings with application details</p>
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs uppercase text-slate-500 font-bold tracking-wide">
                  <tr>
                    {["Company","Email","Phone","Job Details","Posted Date","Application Close Date","Applicants","Actions"].map(h => (
                      <th key={h} className="px-5 py-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-14 text-center text-slate-400">
                        No job postings found.
                      </td>
                    </tr>
                  ) : rows.map(job => (
                    <tr key={job.job_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">{job.company_name}</td>
                      <td className="px-5 py-4 text-slate-600">{job.company_email}</td>
                      <td className="px-5 py-4 text-slate-600">{job.company_phone}</td>
                      <td className="px-5 py-4 text-slate-700">{job.job_title}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{fmt(job.posted_date)}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{fmt(job.application_deadline)}</td>
                      <td className="px-5 py-4">
                        {job.application_count > 0 ? (
                          <button
                            onClick={() => setViewing(job)}
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            {job.application_count} applied
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-xs">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDelete(job.job_id)}
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
              {rows.length} job posting{rows.length !== 1 ? "s" : ""} total
            </div>
          </div>
        )}

        {viewing && <ApplicantsModal job={viewing} onClose={() => setViewing(null)} />}
      </main>
    </div>
  );
}
