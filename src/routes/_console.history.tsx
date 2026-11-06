import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, RunStatusBadge, TypeBadge, ExperimentalBadge, EmptyState, th, td } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { formatKm2 } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/history")({
  head: () => ({
    meta: [
      { title: "سجل التحليلات · MIRSAD" },
      { name: "description", content: "History of all segmentation analysis runs across incidents with model version and review status." },
      { property: "og:title", content: "Analysis History · MIRSAD" },
      { property: "og:description", content: "All analysis runs and their review status." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <HistoryPage />
    </RoleGate>
  ),
});

function HistoryPage() {
  const { runs, incidents } = useDemo();
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const rows = runs
    .map((r) => ({ r, inc: incidents.find((i) => i.id === r.incidentId)! }))
    .filter(({ r, inc }) => (status === "all" || r.status === status) && (type === "all" || inc.type === type))
    .sort((a, b) => b.r.startedAt.localeCompare(a.r.startedAt));

  return (
    <>
      <PageHeader title="سجل التحليلات" en="Analysis History" description="جميع عمليات التحليل المنفذة، وكل منها مرتبط بحادثة واحدة." />
      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">نوع الحادثة</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="field">
              <option value="all">الكل · All</option>
              <option value="flood">فيضان · Flood</option>
              <option value="fire">حريق · Fire</option>
            </select>
          </div>
          <div className="w-56">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">حالة المراجعة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field">
              <option value="all">الكل · All</option>
              <option value="reviewed">تمت المراجعة · Reviewed</option>
              <option value="pending">بانتظار المراجعة · Pending</option>
              <option value="correction">يحتاج تصحيح · Needs correction</option>
            </select>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title="لا توجد نتائج" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>رقم التحليل</th>
                  <th className={th}>الحادثة</th>
                  <th className={th}>النموذج والإصدار</th>
                  <th className={th}>تاريخ التحليل</th>
                  <th className={th}>المساحة المتأثرة</th>
                  <th className={th}>النسبة</th>
                  <th className={th}>الحالة</th>
                  <th className={`${th} text-end`}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(({ r, inc }) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.id}</td>
                    <td className={td}>
                      <Link to="/incidents/$id" params={{ id: inc.id }} className="font-medium hover:text-primary">{inc.name}</Link>
                      <div className="mt-1"><TypeBadge type={inc.type} /></div>
                    </td>
                    <td className={td}>
                      <div className="ltr text-start text-[13px]">{r.model}</div>
                      <div className="flex items-center gap-2">
                        <span className="ltr font-mono text-[11px] text-muted-foreground">{r.modelVersion}</span>
                        {r.experimental && <ExperimentalBadge />}
                      </div>
                    </td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.startedAt}</td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{formatKm2(r.affectedKm2)} km²</td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.affectedPct.toFixed(2)}%</td>
                    <td className={td}><RunStatusBadge status={r.status} /></td>
                    <td className={`${td} text-end`}>
                      <div className="inline-flex gap-1.5">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/results/$runId" params={{ runId: r.id }}><BarChart3 /> النتائج</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/review/$runId" params={{ runId: r.id }}><ClipboardCheck /> مراجعة</Link>
                        </Button>
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
