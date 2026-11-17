import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn, Mail, KeyRound, Map, ShieldCheck, HardHat, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-terrain.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/mirsad/Logo";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DEMO_ACCOUNTS, ROLE_HOME, ROLE_LABELS, type Role } from "@/lib/demo-data";
import { demoActions, useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<Role, typeof Map> = { analyst: Map, admin: ShieldCheck, responder: HardHat };
const ORDER: Role[] = ["analyst", "admin", "responder"];

/**
 * Role-based login. Analyst signs in on /login itself; admin and responder each
 * have their own page (/login/admin, /login/responder). Same demo auth for all.
 */
export function RoleLogin({ role }: { role: Role }) {
  return (
    <SiteLayout>
      <div className="relative overflow-hidden bg-navy-deep">
        <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="bg-login-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-xl border bg-card p-6 shadow-panel sm:p-8">
            <Logo />
            <h1 className="mt-5 text-xl font-bold">تسجيل الدخول</h1>
            <p className="mt-1 text-sm text-muted-foreground">اختر نوع الحساب</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3" role="tablist">
              {ORDER.map((r) => <RoleChoice key={r} role={r} active={r === role} />)}
            </div>
            <div data-role={role} className="mt-6 border-t pt-6">
              <LoginForm role={role} />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function RoleChoice({ role, active }: { role: Role; active: boolean }) {
  const Icon = ROLE_ICONS[role];
  const to = role === "analyst" ? "/login" : role === "admin" ? "/login/admin" : "/login/responder";
  return (
    <Link
      to={to}
      role="tab"
      aria-selected={active}
      data-role={role}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-center text-sm transition-colors",
        active ? "border-primary bg-primary-soft font-semibold text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      <span className={cn("grid h-11 w-11 place-items-center rounded-full", active ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary")}>
        <Icon className="h-5 w-5" />
      </span>
      {ROLE_LABELS[role]}
    </Link>
  );
}

function LoginForm({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { users } = useDemo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() || u.name === email.trim());
    if (!user || !user.active || password !== "demo1234") {
      setError("بيانات الدخول غير صحيحة أو الحساب معطّل.");
      return;
    }
    if (user.role !== role) {
      setError(`هذا الحساب ليس حساب «${ROLE_LABELS[role]}». اختر نوع الحساب الصحيح.`);
      return;
    }
    demoActions.login(user.role, user.name);
    navigate({ to: ROLE_HOME[user.role] });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><span className="h-5 w-1 rounded-full bg-primary" /> دخول {ROLE_LABELS[role]}</h2>
        {role !== "analyst" && (
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><ArrowRight className="h-3.5 w-3.5" /> رجوع</Link>
        )}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="email" autoComplete="username" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="field ps-9 text-start" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">كلمة المرور</label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field px-9" />
          <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="إظهار كلمة المرور" className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && <p className="rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full"><LogIn className="rtl:rotate-180" /> دخول</Button>
      <button
        type="button"
        onClick={() => { setEmail(DEMO_ACCOUNTS[role].email); setPassword("demo1234"); setError(""); }}
        className="w-full rounded-md border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
      >
        تعبئة الحساب التجريبي
      </button>
    </form>
  );
}
