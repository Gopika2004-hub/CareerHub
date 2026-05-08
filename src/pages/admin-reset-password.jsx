import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const AdminResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please try again.");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/reset-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(text || "Failed to reset password");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccessMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#1e293b] px-8 py-8 text-center">
              <AlertCircle size={32} className="text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
            </div>
            <div className="px-8 py-8 text-center">
              <p className="text-gray-600 mb-6">The password reset link is invalid or missing.</p>
              <button
                onClick={() => navigate("/admin/login")}
                className="w-full bg-[#1e293b] hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-white">Set New Password</h1>
            <p className="text-slate-400 text-sm mt-1">Create a strong password for your admin account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Min 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                             bg-gray-50 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                {error}
              </p>
            )}

            {/* Success */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 CareerHub — Restricted Area
        </p>
      </div>
    </div>
  );
};

export default AdminResetPassword;
