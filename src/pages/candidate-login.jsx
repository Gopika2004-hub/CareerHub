import { useSignIn } from "@/lib/auth";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserCircle, Home } from "lucide-react";

const CandidateLogin = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(
    location.state?.archived
      ? "Your account has been suspended. Please contact the admin or complete a new registration."
      : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const archiveRes = await fetch(`/api/check-archived?email=${encodeURIComponent(emailAddress)}` );
      const archiveData = await archiveRes.json();
      if (archiveData.archived) {
        setError("Your account has been suspended. Please contact the admin or complete a new registration.");
        return;
      }
      const result = await signIn.create({ identifier: emailAddress, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#00529b] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserCircle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Candidate Login</h1>
            <p className="text-blue-100 text-sm mt-1">CareerHub Job Seeker Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00529b] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password?portal=candidate"
                  className="text-xs font-medium text-[#00529b] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#00529b] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-candidate"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#00529b] cursor-pointer"
              />
              <label htmlFor="remember-candidate" className="text-sm text-gray-600 cursor-pointer">
                Remember Me
              </label>
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
              className="w-full bg-[#00529b] hover:bg-[#003d75] disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm
                         flex items-center justify-center gap-2"
            >
              {loading ? "Signing In..." : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Footer links */}
          <div className="px-8 pb-8 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/candidate/register" className="font-semibold text-[#00529b] hover:underline">
                Register as Candidate
              </Link>
            </p>
          </div>
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
          Â© 2026 CareerHub â€” Job Seeker Portal
        </p>
      </div>
    </div>
  );
};

export default CandidateLogin;
