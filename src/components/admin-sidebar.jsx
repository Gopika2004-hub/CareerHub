import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Building2, Users, ClipboardList,
  LogOut, ShieldCheck, Pencil, Archive, ChevronDown, ChevronRight,
} from "lucide-react";
import { ADMIN_TOKEN } from "@/components/admin-route";

const NAV = [
  { to: "/admin/dashboard",     Icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/employers",     Icon: Building2,        label: "Employer"     },
  { to: "/admin/candidates",    Icon: Users,            label: "Candidate"    },
  { to: "/admin/applications",  Icon: ClipboardList,    label: "Applications" },
];

const ARCHIVE_CHILDREN = [
  { to: "/admin/archives/employers", label: "Employers" },
  { to: "/admin/archives/candidates", label: "Candidates" },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(
    pathname.startsWith("/admin/archives")
  );
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/logo", { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
      .then(r => r.json())
      .then(data => setLogo(data.logo || ""))
      .catch(console.error);
  }, []);

  // Keep archives open when navigating inside it
  useEffect(() => {
    if (pathname.startsWith("/admin/archives")) setArchiveOpen(true);
  }, [pathname]);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/admin/logo", { method: "POST", headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }, body: form });
      const data = await res.json();
      if (data.logo) setLogo(data.logo);
    } catch (err) {
      console.error("Logo upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    navigate("/");
  }

  const isArchiveActive = pathname.startsWith("/admin/archives");

  return (
    <aside className="w-64 min-h-screen bg-[#1e293b] text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-500 flex items-center justify-center relative">
          {logo ? (
            <img src={`http://localhost:8000${logo}`} alt="Admin Portal Logo" className="w-full h-full object-cover" />
          ) : (
            <ShieldCheck size={22} className="text-white" />
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Change admin logo"
            className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
          >
            {uploading ? <span className="text-[10px]">Uploading...</span> : <Pencil size={14} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
        <div>
          <p className="font-bold text-white text-[15px] leading-tight">CareerHub</p>
          <p className="text-slate-400 text-[11px]">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {NAV.map(({ to, Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium
              ${pathname === to
                ? "bg-orange-500/20 text-orange-400"
                : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* Archives collapsible */}
        <div>
          <button
            onClick={() => setArchiveOpen(o => !o)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors text-[14px] font-medium
              ${isArchiveActive
                ? "bg-orange-500/20 text-orange-400"
                : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
          >
            <span className="flex items-center gap-3">
              <Archive size={18} />
              Archives
            </span>
            {archiveOpen
              ? <ChevronDown size={15} />
              : <ChevronRight size={15} />}
          </button>

          {archiveOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
              {ARCHIVE_CHILDREN.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[13px] font-medium
                    ${pathname === to
                      ? "text-orange-400 bg-orange-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[14px] font-medium
                     text-red-400 hover:text-white hover:bg-red-600/20 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
