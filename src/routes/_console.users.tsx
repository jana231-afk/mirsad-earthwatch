import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { UserPlus, ShieldCheck, Map, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Panel, RoleGate, th, td } from "@/components/mirsad/bits";
import { demoActions, useDemo } from "@/lib/demo-store";
import { ROLE_LABELS, type Role } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/users")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "إدارة المستخدمين · مِرصاد" },
      { name: "description", content: "صفحة مدير النظام لإدارة حسابات المستخدمين وأدوارهم." },
      { property: "og:title", content: "إدارة المستخدمين · مِرصاد" },
      { property: "og:description", content: "إدارة حسابات المديرين والمحللين والمستجيبين الميدانيين." },
    ],
  }),
  component: () => (
    <RoleGate allow={["admin"]}>
      <UsersPage />
    </RoleGate>
  ),
});

const ROLE_DESC: Record<Role, { icon: typeof ShieldCheck; perms: string }> = {
  admin: { icon: ShieldCheck, perms: "إدارة حسابات المستخدمين وأدوارهم." },
  analyst: { icon: Map, perms: "إنشاء الحالات، رفع الصور، تشغيل التحليلات، مراجعة النتائج، وإصدار التقارير." },
  responder: { icon: Eye, perms: "عرض الحالات المصرح بها والنتائج المراجَعة فقط (قراءة فقط)." },
};

function UsersPage() {
  const { users } = useDemo();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("analyst");
  const [err, setErr] = useState("");

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErr("أدخل الاسم وبريداً إلكترونياً صحيحاً.");
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErr("البريد الإلكتروني مستخدم مسبقاً.");
      return;
    }
    setErr("");
    demoActions.addUser({
      id: `U-${String(users.length + 1).padStart(2, "0")}`,
      name: name.trim(),
      email: email.trim(),
      role,
      active: true,
      lastLogin: "—",
    });
    toast.success("تمت إضافة المستخدم", { description: email.trim() });
    setName("");
    setEmail("");
  };

  return (
    <>
      <PageHeader title="إدارة المستخدمين" description="إدارة حسابات المستخدمين وتعيين الأدوار الثلاثة في النظام." />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {(Object.keys(ROLE_DESC) as Role[]).map((r) => {
          const Icon = ROLE_DESC[r].icon;
          return (
            <div key={r} className="rounded-lg border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{ROLE_LABELS[r]}</span>
                <span className="ltr ms-auto font-mono text-sm text-muted-foreground">{users.filter((u) => u.role === r).length}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{ROLE_DESC[r].perms}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel title="الحسابات" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>الاسم</th>
                  <th className={th}>البريد الإلكتروني</th>
                  <th className={th}>الدور</th>
                  <th className={th}>آخر دخول</th>
                  <th className={th}>الحالة</th>
                  <th className={`${th} text-end`}>الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40">
                    <td className={`${td} font-medium`}>{u.name}</td>
                    <td className={`${td} ltr text-start font-mono text-[13px] text-muted-foreground`}>{u.email}</td>
                    <td className={td}>
                      <select
                        value={u.role}
                        onChange={(e) => {
                          demoActions.updateUser(u.id, { role: e.target.value as Role });
                          toast.success("تم تحديث الدور");
                        }}
                        className="field h-8 w-52 text-xs"
                        aria-label={`دور ${u.name}`}
                      >
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{u.lastLogin}</td>
                    <td className={td}>
                      <Badge variant={u.active ? "reviewed" : "closed"}>{u.active ? "نشط" : "معطّل"}</Badge>
                    </td>
                    <td className={`${td} text-end`}>
                      <Button
                        size="sm"
                        variant={u.active ? "outline-destructive" : "outline"}
                        onClick={() => demoActions.updateUser(u.id, { active: !u.active })}
                      >
                        {u.active ? "تعطيل" : "تفعيل"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="إضافة مستخدم" className="self-start">
          <form onSubmit={add} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="user-name" className="text-sm font-medium">الاسم الكامل</label>
              <input id="user-name" value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="user-email" className="text-sm font-medium">البريد الإلكتروني</label>
              <input id="user-email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="field text-start" placeholder="user@mirsad.sa" maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="user-role" className="text-sm font-medium">الدور</label>
              <select id="user-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="field">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button type="submit" className="w-full">
              <UserPlus /> إنشاء الحساب
            </Button>
            <p className="text-[11px] text-muted-foreground">حساب تجريبي؛ كلمة المرور <span className="ltr">demo1234</span>. لا تُرسل رسائل بريد.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}
