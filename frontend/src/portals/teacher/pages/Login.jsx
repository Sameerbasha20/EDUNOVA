import { PenSquare, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, requestOtp, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/teacher" replace />;

  async function handleCredentials(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await requestOtp(email, password);
      setUserId(data.user_id);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(userId, otp);
      navigate("/teacher");
    } catch (err) {
      setError(err?.response?.data?.detail || "Incorrect OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    await resendOtp(userId);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-light">
      <div className="hidden lg:flex flex-col justify-between bg-academic-blue text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-academic-gold flex items-center justify-center font-heading font-bold text-academic-blue">
            E
          </div>
          <span className="font-heading font-semibold text-lg">EduNova Global Academy</span>
        </div>
        <div>
          <PenSquare size={48} className="text-academic-gold mb-6" />
          <h1 className="font-heading text-4xl font-bold leading-tight mb-3">
            Empowering Every
            <br /> Educator.
          </h1>
          <p className="text-white/70 font-sub max-w-sm">
            Attendance, homework, grading, and analytics for every class you teach — in one place.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} EduNova Global Academy Pvt. Ltd.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-bold mb-1">
            {step === 1 ? "Teacher login" : "Verify your identity"}
          </h2>
          <p className="text-ink-secondary text-sm mb-6 font-sub">
            {step === 1
              ? "Sign in with your school email and password."
              : "Enter the 6-digit code sent to your registered email."}
          </p>

          {error && (
            <div className="mb-4 text-sm text-danger bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-primary">Email or username</label>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
                  placeholder="you@edunovaacademy.edu.in"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-primary">Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Checking…" : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="flex items-center gap-2 text-academic-green text-sm bg-emerald-50 rounded-xl px-3 py-2">
                <ShieldCheck size={16} /> OTP sent to your registered email
              </div>
              <div>
                <label className="text-sm font-medium text-ink-primary">6-digit code</label>
                <input
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center tracking-[0.5em] text-lg font-numeric focus-ring outline-none"
                  placeholder="••••••"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setStep(1)} className="text-ink-secondary hover:underline">
                  ← Back
                </button>
                <button type="button" onClick={handleResend} className="text-academic-blue hover:underline">
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
