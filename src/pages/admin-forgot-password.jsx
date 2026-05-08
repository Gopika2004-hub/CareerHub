import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";

const AdminForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "verify" | "new-password"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverToken, setServerToken] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [emailError, setEmailError] = useState("");

  // Step 1: send OTP to admin email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setDevOtp("");
    setEmailError("");

    try {
      const res = await fetch("/api/admin/forgot-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server error. Please try again."); }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No admin account found for this email.");
      }

      if (data.devOtp) {
        setDevOtp(data.devOtp);
        if (data.emailError) setEmailError(data.emailError);
        setSuccessMessage("Email delivery failed. Use the OTP shown below to continue.");
      } else {
        setSuccessMessage(`A 6-digit verification code has been sent to ${email}.`);
      }
      setStep("verify");
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP and get reset token
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify-otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server error. Please try again."); }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid or expired code. Please try again.");
      }

      setServerToken(data.token);
      setSuccessMessage("Code verified. Create your new admin password.");
      setStep("new-password");
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set new password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/reset-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: serverToken, password: newPassword }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server error. Please try again."); }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccessMessage("Password updated successfully! Redirecting to login…");
      localStorage.removeItem("admin_token");
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to save new password.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["email", "verify", "new-password"];
  const stepTitle = step === "email"
    ? "Reset Admin Password"
    : step === "verify"
    ? "Enter Verification Code"
    : "Set New Password";
  const stepDesc = step === "email"
    ? "Enter your admin email to receive a verification code"
    : step === "verify"
    ? "Enter the 6-digit code sent to your email"
    : "Create a strong new password for your admin account";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {(error || successMessage) && (
        <div className="fixed inset-x-4 top-4 z-50 flex justify-center">
          <div
            role="alert"
            className={`w-full max-w-xl rounded-2xl border px-4 py-3 shadow-lg ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <p className="text-sm font-medium">{error || successMessage}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e293b] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{stepTitle}</h1>
            <p className="text-slate-400 text-sm mt-1">{stepDesc}</p>
          </div>

          <div className="px-8 py-8">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${step === s ? "bg-orange-500 text-white"
                      : steps.indexOf(step) > i ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-500"}`}>
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-8 h-0.5 ${steps.indexOf(step) > i ? "bg-green-400" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? "Sending Code…" : "Send Verification Code"}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                {/* Dev fallback: show OTP when email delivery is not configured */}
                {devOtp && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Email Delivery Failed — Use This OTP
                    </p>
                    <p className="text-4xl font-extrabold tracking-[0.35em] text-amber-800 py-1">{devOtp}</p>
                    {emailError && (
                      <p className="text-[11px] text-red-600 font-mono bg-red-50 border border-red-200 rounded px-2 py-1 text-left break-all">
                        SMTP error: {emailError}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center
                               tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                  />
                  {!devOtp && (
                    <p className="text-xs text-slate-400 mt-1.5 text-center">
                      Check your email at <span className="font-medium text-slate-600">{email}</span>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? "Verifying…" : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setCode(""); setError(""); setSuccessMessage(""); setDevOtp(""); setEmailError(""); }}
                  className="w-full text-slate-500 hover:text-slate-700 text-sm py-1 transition-colors"
                >
                  Resend code
                </button>
              </form>
            )}

            {/* Step 3: New password */}
            {step === "new-password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? "Saving…" : "Save New Password"}
                </button>
              </form>
            )}

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link to="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back to Admin Login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">© 2026 CareerHub — Restricted Area</p>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
