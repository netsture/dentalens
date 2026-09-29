import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { DEMO_CREDENTIALS, useAuth } from "@/lib/auth";

const stats = [
  { value: "2.8K+", label: "Patients" },
  { value: "42", label: "Today Appts" },
  { value: "99.9%", label: "Uptime" },
  { value: "HIPAA", label: "Ready" },
];

const features = [
  "Appointments",
  "Patient Chart",
  "Billing",
  "Claims",
  "Imaging",
  "Documents",
  "Reports",
  "Settings",
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "admin@gmail.com", password: "demo123" });

  useEffect(() => {
    const prev = { overflow: document.body.style.overflow, height: document.body.style.height };
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.height = prev.height;
    };
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      if (!remember) {
        /* demo only — session already stored */
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row font-sans min-h-screen">
      

      <div className="flex-1 flex flex-col items-center bg-[#f3f9fa] px-4 sm:px-6 py-8 sm:py-10 sticky top-0 h-screen overflow-y-auto">
        <div className="w-full max-w-[420px] flex flex-col my-auto py-4">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14a89e] to-[#1c6db2] text-white font-black flex items-center justify-center">
                DL
              </div>
              <span className="font-bold text-xl text-[#0f2d52]">
              DentSaas<span className="text-teal-600">.ai</span>
              </span>
            </Link>
          </div>

          <div className="w-full bg-white rounded-xl sm:rounded-2xl border border-slate-100 overflow-hidden auth-card">
            <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-[22px] font-black text-[#0f2d52] leading-none">Welcome Back</h2>
              <p className="text-[12.5px] text-slate-500 mt-1.5">
                Sign in to access your Dental Practice Management Service.
              </p>
            </div>

            <div className="px-5 sm:px-8 pt-5 pb-5 flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 text-red-600 px-3.5 py-2.5 rounded-xl border border-red-100 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">
                    Email / Username
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-10 px-3.5 text-[12.5px] rounded-xl text-[#0f2d52] auth-input"
                    placeholder="admin@dentsaas.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full h-10 pl-3.5 pr-10 text-[12.5px] rounded-xl text-[#0f2d52] auth-input"
                      placeholder="demo123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 border-none bg-transparent cursor-pointer"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember((v) => !v)}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <span className="text-[12px] text-slate-600">Remember Me</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-[13.5px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer border-none auth-btn-submit"
                >
                  {loading ? "Authenticating..." : "Sign In →"}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick-Fill Demo Accounts
                </p>
                <div className="flex gap-2">
                  {DEMO_CREDENTIALS.map((c) => (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => {
                        setForm({ email: c.email, password: c.password });
                        setError(null);
                      }}
                      className="flex-1 py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold border border-teal-100 cursor-pointer"
                    >
                      {c.role}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  admin@dentsaas.com / demo123
                </p>
              </div>
            </div>

            <div className="mx-5 sm:mx-8 mb-5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-100">
              <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Protected by Enterprise Security with <strong>MFA</strong>, <strong>RBAC</strong> and{" "}
                <strong>Audit Logging</strong>.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10.5px] text-slate-400">
            © {new Date().getFullYear()} DentSaas · Version 1.0.0
          </p>
          <div className="mt-2 flex justify-center gap-3 text-[10.5px] text-slate-400">
            <a href="#" className="hover:text-teal-600">Privacy Policy</a>
            <a href="#" className="hover:text-teal-600">Terms of Service</a>
            <a href="#" className="hover:text-teal-600">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
