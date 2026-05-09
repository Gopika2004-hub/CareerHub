import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get("portal"); // "employer" | null (null = candidate)
  const loginPath = portal === "employer" ? "/employer/login" : "/candidate/login";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // "email", "verify", "new-password"
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      // Block archived accounts from resetting password
      const archiveRes = await fetch(`/api/check-archived?email=${encodeURIComponent(email)}`);
      const archiveData = await archiveRes.json();
      if (archiveData.archived) {
        setError("Your account has been suspended. Please contact the admin or complete a new registration.");
        return;
      }

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSuccessMessage(`Reset code sent to ${email}. Check your email.`);
      setStep("verify");
    } catch (err) {
      const errorMsg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to send reset email. Please try again.";

      const normalized = errorMsg.toLowerCase();
      if (/(no user|not found|identifier|unknown user|invalid email)/i.test(normalized)) {
        setError("No Registered Email Id Found");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      // Verify the code and reset password
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStep("new-password");
        setSuccessMessage("Code verified. Enter your new password below.");
        return;
      }

      if (result.status === "complete") {
        setSuccessMessage("Password has been reset. Redirecting to login...");
        setTimeout(() => navigate(loginPath), 2000);
        return;
      }

      setError("Unexpected verification response. Please try again.");
    } catch (err) {
      const errorMsg = err?.errors?.[0]?.message || "Invalid code. Please try again.";
      const normalized = errorMsg.toLowerCase();
      if (/(code|invalid|expired|not found)/i.test(normalized)) {
        setError("Invalid reset code. Please check the email and try again.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    if (!newPassword || !confirmPassword) {
      setError("Please enter a new password and confirm it.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        setSuccessMessage("Password updated! Signing out active sessions — please log in again.");
        // Sign out the session Clerk auto-created on reset, then redirect to fresh login
        await signOut();
        setTimeout(() => navigate(loginPath), 2000);
        return;
      }

      setError("Unable to reset password. Please try again.");
    } catch (err) {
      const errorMsg = err?.errors?.[0]?.message || "Failed to save new password. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {(error || successMessage) && (
        <div className="fixed inset-x-4 top-4 z-50 flex justify-center sm:inset-x-auto">
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
      <Card className="w-full max-w-md border-black/10 shadow-xl dark:bg-zinc-900 dark:border-white/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-black">Reset Password</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your email to receive a password reset link"
              : "Enter the code sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-bold py-6"
                variant="blue"
                disabled={loading || !email}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : step === "verify" ? (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter code from email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold py-6"
                variant="blue"
                disabled={loading || !code}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold py-6"
                variant="blue"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? "Saving..." : "Save New Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to={loginPath}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
