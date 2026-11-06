import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, Waves, Flame, CheckCircle2, Plus, Eye, ClipboardCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  StatCard,
  TypeBadge,
  IncidentStatusBadge,
  RoleGate,
  th,
  td,
} from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { ROLE_LABELS, RUN_STATUS_LABELS, type RunStatus, type Role } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة المعلومات · MIRSAD" },
      { name: "description", content: "MIRSAD dashboard: incident counts, completed analyses and recent flood and fire incidents." },
      { property: "og:title", content: "Dashboard · MIRSAD" },
      { property: "og:description", content: "Overview of incidents and completed satellite image analyses." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst", "admin"]}>
      <Dashboard />
    </RoleGate>
  ),
});

function Dashboard() {
  const { incidents, runs, role, users } = useDemo();
  const floods = incidents.filter((i) => i.type === "flood").length;
  const fires = incidents.filter((i) => i.type === "fire").length;
  const completed = runs.filter((r) => r.status !== "processing" && r.status !== "failed").length;
  const recent = [...incidents].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const pending = runs.filter((r) => r.status === "pending");

  const byStatus = (["reviewed", "pending", "correction"] as RunStatus[]).map((s) => ({
    s,
    n: runs.filter((r) => r.status === s).length,
  }));
  const maxN = Math.max(1, ...byStatus.map((b) => b.n));

  return (
    <>
      <PageHeader
        title="لوحة المعلومات"
        en="Dashboard"
        description="ملخص الحوادث المسجلة والتحليلات المكتملة في النظام."
        actions={
          role === "analyst" && (
            <Button asChild size="lg">
              <Link to="/incidents/new">
                <Plus /> إنشاء حادثة جديدة
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الحوادث" en="Total incidents" value={incidents.length} icon={<FolderOpen className="h-4 w-4" />} tone="navy" />
        <StatCard label="حوادث الفيضانات" en="Flood incidents" value={floods} icon={<Waves className="h-4 w-4" />} tone="water" />
        <StatCard label="حوادث الحرائق / المناطق المحترقة" en="Fire / burned-area incidents" value={fires} icon={<Flame className="h-4 w-4" />} tone="burn" />
        <StatCard label="التحليلات المكتملة" en="Analyses completed" value={completed} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel
          title="أحدث الحوادث"
          en="Recent incidents"
          bodyClassName="p-0"
          actions={
            role === "analyst" && (
              <Link to="/incidents" className="text-xs font-medium text-primary hover:underline">
                عرض الكل
              </Link>
            )
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>اسم الحادثة</th>
                  <th className={th}>النوع</th>
                  <th className={th}>الموقع</th>
                  <th className={th}>التاريخ</th>
                  <th className={th}>الحالة</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className={td}>
                      <div className="font-medium">{i.name}</div>
                      <div className="ltr text-start font-mono text-[11px] text-muted-foreground">{i.id}</div>
                    </td>
                    <td className={td}><TypeBadge type={i.type} /></td>
                    <td className={`${td} text-muted-foreground`}>{i.location}</td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{i.date}</td>
                    <td className={td}><IncidentStatusBadge status={i.status} /></td>
                    <td className={`${td} text-end`}>
                      {role === "analyst" ? (
                        <Button asChild variant="outline" size="sm">
                          <Link to="/incidents/$id" params={{ id: i.id }}>
                            <Eye /> عرض
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="التحليلات حسب حالة المراجعة" en="Analyses by review status">
            <div className="space-y-3">
              {byStatus.map(({ s, n }) => (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{RUN_STATUS_LABELS[s].ar}</span>
                    <span className="font-mono">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className={`h-2 rounded-full ${s === "reviewed" ? "bg-success" : s === "pending" ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${(n / maxN) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {role === "analyst" ? (
            <Panel title="بانتظار مراجعتك" en="Awaiting review" bodyClassName="p-0">
              {pending.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">لا توجد تحليلات بانتظار المراجعة.</p>
              ) : (
                <ul className="divide-y">
                  {pending.map((r) => {
                    const inc = incidents.find((i) => i.id === r.incidentId);
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{inc?.name}</div>
                          <div className="ltr text-start font-mono text-[11px] text-muted-foreground">
                            {r.id} · {r.startedAt}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="soft">
                          <Link to="/review/$runId" params={{ runId: r.id }}>
                            <ClipboardCheck /> مراجعة
                          </Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          ) : (
            <Panel title="المستخدمون حسب الدور" en="Users by role">
              <ul className="space-y-2 text-sm">
                {(["admin", "analyst", "responder"] as Role[]).map((r) => (
                  <li key={r} className="flex justify-between">
                    <span>{ROLE_LABELS[r].ar}</span>
                    <span className="font-mono">{users.filter((u) => u.role === r).length}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="navy" className="mt-4 w-full">
                <Link to="/users">
                  <Users /> إدارة المستخدمين
                </Link>
              </Button>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
