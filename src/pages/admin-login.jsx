import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Home } from "lucide-react";
import { ADMIN_TOKEN, isAdminLoggedIn } from "@/components/admin-route";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [captcha,  setCaptcha]  = useState({ a: 0, b: 0 });
  const [answer,   setAnswer]   = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) navigate("/admin/dashboard", { replace: true });
    setCaptcha({ a: randomInt(1, 9), b: randomInt(1, 9) });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (parseInt(answer, 10) !== captcha.a + captcha.b) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      setCaptcha({ a: randomInt(1, 9), b: randomInt(1, 9) });
      setAnswer("");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server error. Please try again."); }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password.");
      }

      localStorage.setItem("admin_token", ADMIN_TOKEN);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setCaptcha({ a: randomInt(1, 9), b: randomInt(1, 9) });
      setAnswer("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e293b] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">CareerHub Administration Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" autoComplete="off">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="off"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                           bg-gray-50 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs font-medium text-orange-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="new-password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Are you human?
              </p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-700">
                  {captcha.a} + {captcha.b} =
                </span>
                <input
                  type="number"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="?"
                  required
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center
                             focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <Home size={14} />
            Return to Homepage
          </Link>
        </div>
        <p className="text-center text-slate-500 text-xs mt-3">
          © 2026 CareerHub — Restricted Area
        </p>
      </div>
    </div>
  );
}
