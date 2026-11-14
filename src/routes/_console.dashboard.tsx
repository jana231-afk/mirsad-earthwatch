import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, Waves, Flame, CheckCircle2, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, StatCard, TypeBadge, AutoStatusBadge, DateRange, EmptyState, th, td } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { formatDate } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "لوحة التحكم · مِرصاد" },
      { name: "description", content: "ملخص الحالات والتحليلات المكتملة لمحلل نظم المعلومات الجغرافية." },
      { property: "og:title", content: "لوحة التحكم · مِرصاد" },
      { property: "og:description", content: "إجمالي الحالات وأحدث سجلات الفيضانات والحرائق." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <Dashboard />
    </RoleGate>
  ),
});

function Dashboard() {
  const { incidents, runs, userName } = useDemo();
  const recent = [...incidents].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 6);
  const pending = runs.filter((r) => r.status === "pending");
  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        description={`مرحباً ${userName}، هذا ملخص الحالات المسجلة في النظام.`}
        actions={
          <Button asChild>
            <Link to="/incidents/new"><Plus /> إنشاء حالة جديدة</Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الحالات" value={incidents.length} icon={<FolderOpen className="h-5 w-5" />} tone="navy" />
        <StatCard label="حالات الفيضانات" value={incidents.filter((i) => i.type === "flood").length} icon={<Waves className="h-5 w-5" />} tone="water" />
        <StatCard label="حالات الحرائق" value={incidents.filter((i) => i.type === "fire").length} icon={<Flame className="h-5 w-5" />} tone="burn" />
        <StatCard label="التحليلات المكتملة" value={runs.filter((r) => r.status === "reviewed").length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" hint="التحليلات التي تمت مراجعتها" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel title="أحدث الحالات" actions={<Link to="/incidents" className="text-xs text-primary hover:underline">عرض الكل</Link>} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>اسم الحالة</th>
                  <th className={th}>نوع الكارثة</th>
                  <th className={th}>الموقع</th>
                  <th className={th}>فترة الحالة (من – إلى)</th>
                  <th className={th}>الحالة</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className={`${td} font-medium`}>{i.name}</td>
                    <td className={td}><TypeBadge type={i.type} /></td>
                    <td className={`${td} text-muted-foreground`}>{i.location}</td>
                    <td className={td}><DateRange from={i.startDate} to={i.endDate} /></td>
                    <td className={td}><AutoStatusBadge incident={i} /></td>
                    <td className={`${td} text-end`}>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/incidents/$id" params={{ id: i.id }}><Eye /> عرض</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="بانتظار المراجعة">
          {pending.length === 0 ? (
            <EmptyState title="لا توجد نتائج بانتظار المراجعة" />
          ) : (
            <ul className="space-y-3">
              {pending.map((r) => {
                const inc = incidents.find((i) => i.id === r.incidentId);
                return (
                  <li key={r.id} className="rounded-md border p-3">
                    <div className="text-sm font-medium">{inc?.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground"><span className="ltr">{r.id}</span> · {formatDate(r.startedAt)}</div>
                    <Button asChild size="sm" variant="soft" className="mt-2">
                      <Link to="/review/$runId" params={{ runId: r.id }}>مراجعة</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
