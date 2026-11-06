import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn, Mail, KeyRound, Satellite } from "lucide-react";
import loginBg from "@/assets/login-satellite.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/mirsad/Logo";
import { DEMO_ACCOUNTS, ROLE_LABELS, USERS, type Role } from "@/lib/demo-data";
import { demoActions } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول · MIRSAD" },
      { name: "description", content: "Sign in to MIRSAD, the AI-based disaster mapping and assessment system for flood and burned-area analysis." },
      { property: "og:title", content: "MIRSAD – AI-Based Disaster Mapping and Assessment" },
      { property: "og:description", content: "Analyze satellite images of floods and burned areas, map results, and generate PDF assessment reports." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const user = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() || u.name === email.trim());
    if (!email.trim() || !password) {
      setError("يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور.");
      return;
    }
    if (!user || !user.active) {
      setError("بيانات الدخول غير صحيحة أو الحساب معطّل.");
      return;
    }
    demoActions.login(user.role, user.name);
    navigate({ to: user.role === "responder" ? "/field" : "/dashboard" });
  };

  const fill = (role: Role) => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword("demo1234");
    setError("");
  };

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-navy-deep">
      <img src={loginBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="bg-login-overlay absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_420px]">
        <div className="hidden text-navy-foreground lg:block">
          <Logo inverted />
          <h1 className="mt-10 max-w-lg text-4xl font-bold leading-[1.35]">
            رسم وتقييم مناطق الفيضانات والحرائق من صور الأقمار الصناعية
          </h1>
          <p className="ltr mt-3 text-sm text-navy-muted">AI-Based Disaster Mapping and Assessment System</p>
          <ul className="mt-8 space-y-3 text-sm text-navy-foreground/85">
            {[
              "تجزئة صور GeoTIFF باستخدام نماذج U-Net",
              "حساب المساحات المتأثرة بالكيلومتر المربع",
              "مراجعة المحلل واعتماد النتائج",
              "إصدار تقارير تقييم بصيغة PDF",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-navy-line/40 bg-card p-8 shadow-panel">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mb-6 lg:mt-0 mt-6">
            <h2 className="text-xl font-bold">تسجيل الدخول</h2>
            <p className="ltr text-start text-xs text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                اسم المستخدم أو البريد الإلكتروني <span className="ltr text-xs text-muted-foreground">Username / Email</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  dir="ltr"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mirsad.sa"
                  className="field ps-9 text-start"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور <span className="ltr text-xs text-muted-foreground">Password</span>
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  dir="ltr"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field px-9 text-start"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label="إظهار كلمة المرور"
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="w-full">
              <LogIn className="rtl:rotate-180" />
              دخول · Login
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Satellite className="h-3.5 w-3.5" />
              حسابات العرض التجريبي · Demo accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["analyst", "admin", "responder"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => fill(r)}
                  className="rounded-md border bg-card px-2 py-2 text-[11px] font-medium leading-tight hover:border-primary hover:text-primary"
                >
                  {ROLE_LABELS[r].ar}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            مشروع تخرج · Graduation Project — © 2026 MIRSAD
          </p>
        </div>
      </div>
    </div>
  );
}
