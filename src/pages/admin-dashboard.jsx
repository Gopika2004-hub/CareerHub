import { useEffect, useState } from "react";
import { Building2, Users, ClipboardList } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";

const H = { Authorization: `Bearer ${ADMIN_TOKEN}` };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: H })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const CARDS = [
    { label: "Total Employers",    value: stats?.employers    ?? "—", Icon: Building2,    color: "bg-blue-50 text-blue-600",   border: "border-l-blue-500",  path: "/admin/employers" },
    { label: "Total Candidates",   value: stats?.candidates   ?? "—", Icon: Users,        color: "bg-green-50 text-green-600", border: "border-l-green-500", path: "/admin/candidates" },
    { label: "Total Applications", value: stats?.applications ?? "—", Icon: ClipboardList, color: "bg-orange-50 text-orange-600", border: "border-l-orange-500", path: "/admin/applications" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of your job portal</p>
        </header>

        {loading ? (
          <BarLoader width="100%" color="#f97316" />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {CARDS.map(({ label, value, Icon, color, border, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${border} p-6 flex items-center gap-5 hover:shadow-md hover:scale-105 transition-all cursor-pointer text-left`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                  </div>
                </button>
              ))}
            </div>

          </>
        )}
      </main>
    </div>
  );
}
