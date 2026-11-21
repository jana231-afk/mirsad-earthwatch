import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, RunStatusBadge, TypeBadge, th, td } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { RUN_STATUS_LABELS, formatDate, formatKm2, formatPct, latestDay, type RunStatus } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/history")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "سجل التحليلات · مِرصاد" },
      { name: "description", content: "جميع عمليات التحليل الآلي وحالة مراجعتها." },
      { property: "og:title", content: "سجل التحليلات · مِرصاد" },
      { property: "og:description", content: "سجل التحليلات مع المساحة المتأثرة وحالة المراجعة." },
    ],
  }),
  component: () => (<RoleGate allow={["analyst"]}><History /></RoleGate>),
});

function History() {
  const { runs, incidents } = useDemo();
  const [f, setF] = useState<"all" | RunStatus>("all");
  const rows = runs.filter((r) => f === "all" || r.status === f).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return (
    <>
      <PageHeader title="سجل التحليلات" actions={
        <select value={f} onChange={(e) => setF(e.target.value as typeof f)} className="field w-48" aria-label="حالة المراجعة">
          <option value="all">كل حالات المراجعة</option>
          {(["reviewed", "pending", "correction"] as RunStatus[]).map((s) => <option key={s} value={s}>{RUN_STATUS_LABELS[s]}</option>)}
        </select>} />
      <Panel bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50"><tr>
              {["رقم التحليل", "الحالة", "نوع الكارثة", "عدد الصور", "تاريخ التحليل", "تاريخ الكارثة", "المساحة المتأثرة", "حالة المراجعة", ""].map((h) => <th key={h} className={th}>{h}</th>)}
            </tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const inc = incidents.find((i) => i.id === r.incidentId);
                const d = latestDay(r);
                return (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className={`${td} ltr text-start font-mono text-xs`}>{r.id}</td>
                    <td className={`${td} font-medium`}>{inc?.name}</td>
                    <td className={td}>{inc && <TypeBadge type={inc.type} />}</td>
                    <td className={td}>{r.days.length}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(r.startedAt)}</td>
                    <td className={`${td} whitespace-nowrap`}>{inc ? formatDate(inc.startDate) : "—"}</td>
                    <td className={`${td} whitespace-nowrap`}><span className="ltr font-mono">{formatKm2(d.affectedKm2)}</span> km² · <span className="ltr font-mono">{formatPct(d.affectedPct)}</span></td>
                    <td className={td}><RunStatusBadge status={r.status} /></td>
                    <td className={`${td} text-end`}><div className="inline-flex gap-1.5">
                      <Button asChild size="sm" variant="outline"><Link to="/results/$runId" params={{ runId: r.id }}><Eye /> عرض</Link></Button>
                      <Button asChild size="sm" variant="ghost"><Link to="/review/$runId" params={{ runId: r.id }}><ClipboardCheck /> مراجعة</Link></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
