import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn, Mail, KeyRound, UserRound } from "lucide-react";
import heroBg from "@/assets/hero-terrain.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/mirsad/Logo";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DEMO_ACCOUNTS, ROLE_HOME, ROLE_LABELS, type Role } from "@/lib/demo-data";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول · مِرصاد" },
      { name: "description", content: "تسجيل الدخول إلى نظام مِرصاد لرسم وتقييم الكوارث." },
      { property: "og:title", content: "تسجيل الدخول · مِرصاد" },
      { property: "og:description", content: "الدخول إلى لوحة المحلل أو المدير أو المستجيب الميداني." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { users } = useDemo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور.");
      return;
    }
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() || u.name === email.trim());
    if (!user || !user.active || password !== "demo1234") {
      setError("بيانات الدخول غير صحيحة أو الحساب معطّل.");
      return;
    }
    demoActions.login(user.role, user.name);
    navigate({ to: ROLE_HOME[user.role] });
  };

  const fill = (role: Role) => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword("demo1234");
    setError("");
  };

  return (
    <SiteLayout>
      <div className="relative overflow-hidden bg-navy-deep">
        <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="bg-login-overlay absolute inset-0" />
        <div className="relative mx-auto flex max-w-7xl justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-panel">
            <Logo />
            <h1 className="mb-6 mt-6 text-xl font-bold">تسجيل الدخول</h1>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">اسم المستخدم أو البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field ps-9" />
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
            </form>
            <div className="mt-6 rounded-lg border border-dashed bg-muted/50 p-4">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">حسابات تجريبية</div>
              <div className="grid gap-2">
                {(["analyst", "admin", "responder"] as Role[]).map((r) => (
                  <button key={r} type="button" onClick={() => fill(r)} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:border-primary hover:text-primary">
                    <UserRound className="h-4 w-4" /> {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
