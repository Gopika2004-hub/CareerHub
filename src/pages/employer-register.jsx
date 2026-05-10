import { useSignUp } from "@/lib/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Building2, Mail, Phone, Lock, User, Home } from "lucide-react";

const EmployerRegister = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [hrName, setHrName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");
    try {
      await signUp.create({
        firstName: hrName,
        emailAddress,
        password,
        unsafeMetadata: { role: "recruiter", company: companyName, mobile: mobileNumber },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#1e3a5f] px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
              <p className="text-blue-100 text-sm mt-1">Enter the code sent to {emailAddress}</p>
            </div>
            <form onSubmit={handleVerify} className="px-8 py-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xl text-center tracking-widest
                             focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a5f] hover:bg-[#152c47] disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                {loading ? "Verifying..." : "Complete Registration"}
              </button>
            </form>
          </div>
          <div className="text-center mt-5">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              <Home size={14} />
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1e3a5f] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Employer Registration</h1>
            <p className="text-blue-100 text-sm mt-1">Register your company to start hiring talent</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">HR / Recruiter Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="company@example.com"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
                               bg-gray-50 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent
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
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] hover:bg-[#152c47] disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm
                         flex items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : <><UserPlus size={16} /> Register Now</>}
            </button>
          </form>

          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/employer/login" className="font-semibold text-[#1e3a5f] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors">
            <Home size={14} />
            Return to Homepage
          </Link>
        </div>
        <p className="text-center text-slate-500 text-xs mt-3">Â© 2026 CareerHub â€” Recruiter Portal</p>
      </div>
    </div>
  );
};

export default EmployerRegister;
