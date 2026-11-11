import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, TypeBadge, AutoStatusBadge, DateRange, EmptyState, th, td } from "@/components/mirsad/bits";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { formatKm2, formatPct, latestDay } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/field/")({
  head: () => ({
    meta: [
      { title: "الحالات المصرح بها · مِرصاد" },
      { name: "description", content: "قائمة الحالات المتاحة للمستجيب الميداني مع آخر نتيجة مراجَعة." },
      { property: "og:title", content: "الحالات المصرح بها · مِرصاد" },
      { property: "og:description", content: "عرض للقراءة فقط للنتائج المراجَعة." },
    ],
  }),
  component: () => (<RoleGate allow={["responder"]}><FieldList /></RoleGate>),
});

function FieldList() {
  const { incidents, runs } = useDemo();
  const rows = incidents.filter((i) => i.sharedWithResponders);
  return (
    <>
      <PageHeader title="الحالات المصرح بها" description="عرض للقراءة فقط. تظهر هنا النتائج المراجَعة فقط." />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? <div className="p-5"><EmptyState title="لا توجد حالات مصرح بها" /></div> : (
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
