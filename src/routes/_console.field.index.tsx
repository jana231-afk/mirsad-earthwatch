import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, TypeBadge, AutoStatusBadge, DateRange, EmptyState, th, td } from "@/components/mirsad/bits";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { formatKm2, formatPct, incidentStatus, latestDay, type IncidentStatus, type IncidentType } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/field/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "الحالات المصرح بها · مِرصاد" },
      { name: "description", content: "قائمة الحالات المتاحة للمستجيب الميداني مع آخر نتيجة مراجَعة." },
      { property: "og:title", content: "الحالات المصرح بها · مِرصاد" },
      { property: "og:description", content: "عرض للقراءة فقط للنتائج المراجَعة." },
    ],
  }),
  component: () => (<RoleGate allow={["responder"]}><FieldList /></RoleGate>),
});

function FieldList() {
  const { incidents, runs, images } = useDemo();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | IncidentType>("all");
  const [status, setStatus] = useState<"all" | IncidentStatus>("all");
  const rows = incidents
    .filter((i) => i.sharedWithResponders)
    .filter((i) => (!q.trim() || i.name.includes(q.trim())) && (type === "all" || i.type === type) && (status === "all" || incidentStatus(i, images) === status))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return (
    <>
      <PageHeader title="الحالات المصرح بها" description="عرض للقراءة فقط. تظهر هنا النتائج المراجَعة فقط." />
      <Panel bodyClassName="p-0">
        <div className="border-b p-4">
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
        {rows.length === 0 ? <div className="p-5"><EmptyState title="لا توجد حالات مطابقة" /></div> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="border-b bg-muted/50"><tr>{["الحالة", "نوع الكارثة", "الموقع", "الفترة", "الحالة", "آخر نتيجة مراجَعة", ""].map((h, k) => <th key={k} className={th}>{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((i) => {
                const r = latestReviewedRun(runs, i.id);
                const d = r && latestDay(r);
                return (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className={`${td} font-medium`}>{i.name}</td>
                    <td className={td}><TypeBadge type={i.type} /></td>
                    <td className={`${td} text-muted-foreground`}>{i.location}</td>
                    <td className={td}><DateRange from={i.startDate} to={i.endDate} /></td>
                    <td className={td}><AutoStatusBadge incident={i} /></td>
                    <td className={td}>{d ? <span><span className="ltr font-mono">{formatPct(d.affectedPct)}</span> · <span className="ltr font-mono">{formatKm2(d.affectedKm2)}</span> km²</span> : <span className="text-muted-foreground">لا توجد</span>}</td>
                    <td className={`${td} text-end`}><Button asChild size="sm" variant="outline"><Link to="/field/$id" params={{ id: i.id }}><Eye /> عرض</Link></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </Panel>
    </>
  );
}
