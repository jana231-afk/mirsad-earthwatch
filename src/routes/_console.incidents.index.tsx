import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, TypeBadge, IncidentStatusBadge, EmptyState, th, td } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { formatDate, incidentStatus, type IncidentStatus, type IncidentType } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/incidents/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "الحالات · مِرصاد" },
      { name: "description", content: "إدارة حالات الفيضانات والحرائق والبحث فيها وتصفيتها." },
      { property: "og:title", content: "الحالات · مِرصاد" },
      { property: "og:description", content: "قائمة حالات الكوارث مع الحالة الآلية نشطة أو مغلقة." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <IncidentsPage />
    </RoleGate>
  ),
});

function IncidentsPage() {
  const { incidents, images } = useDemo();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | IncidentType>("all");
  const [status, setStatus] = useState<"all" | IncidentStatus>("all");
  const rows = incidents
    .map((i) => ({ i, s: incidentStatus(i, images) }))
    .filter(({ i, s }) => (!q.trim() || i.name.includes(q.trim())) && (type === "all" || i.type === type) && (status === "all" || s === status))
    .sort((a, b) => b.i.startDate.localeCompare(a.i.startDate));

  return (
    <>
      <PageHeader
        title="الحالات"
        description="جميع سجلات الكوارث المسجلة في النظام."
        actions={<Button asChild><Link to="/incidents/new"><Plus /> إنشاء حالة جديدة</Link></Button>}
      />
      <Panel bodyClassName="p-0">
        <div className="space-y-3 border-b p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="البحث باسم الحالة" className="field ps-9" />
            </div>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field w-40" aria-label="نوع الكارثة">
              <option value="all">كل الأنواع</option>
              <option value="flood">فيضان</option>
              <option value="fire">حريق</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field w-40" aria-label="الحالة">
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="closed">مغلقة</option>
            </select>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title="لا توجد نتائج مطابقة" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>الاسم</th>
                  <th className={th}>نوع الكارثة</th>
                  <th className={th}>الموقع</th>
                  <th className={th}>تاريخ البداية</th>
                  <th className={th}>تاريخ النهاية</th>
                  <th className={th}>الحالة</th>
                  <th className={`${th} text-end`}>عرض / تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(({ i, s }) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className={td}>
                      <div className="font-medium">{i.name}</div>
                      <div className="ltr text-start text-xs text-muted-foreground">{i.id}</div>
                    </td>
                    <td className={td}><TypeBadge type={i.type} /></td>
                    <td className={`${td} text-muted-foreground`}>{i.location}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(i.startDate)}</td>
                    <td className={`${td} whitespace-nowrap`}>{i.endDate ? formatDate(i.endDate) : <span className="text-primary">مستمرة</span>}</td>
                    <td className={td}><IncidentStatusBadge status={s} /></td>
                    <td className={`${td} text-end`}>
                      <div className="inline-flex gap-1.5">
                        <Button asChild size="sm" variant="outline"><Link to="/incidents/$id" params={{ id: i.id }}><Eye /> عرض</Link></Button>
                        <Button asChild size="sm" variant="ghost"><Link to="/incidents/$id/edit" params={{ id: i.id }}><Pencil /> تعديل</Link></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
