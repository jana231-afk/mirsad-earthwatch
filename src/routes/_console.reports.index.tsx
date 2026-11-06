import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, TypeBadge, Notice, th, td } from "@/components/mirsad/bits";
import { useDemo } from "@/lib/demo-store";
import { formatKm2 } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/reports/")({
  head: () => ({
    meta: [
      { title: "التقارير · MIRSAD" },
      { name: "description", content: "PDF assessment reports generated from reviewed flood and burned-area analyses." },
      { property: "og:title", content: "Reports · MIRSAD" },
      { property: "og:description", content: "Download PDF assessment reports for reviewed analyses." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <ReportsPage />
    </RoleGate>
  ),
});

function ReportsPage() {
  const { runs, incidents } = useDemo();
  const rows = runs
    .filter((r) => r.status === "reviewed")
    .map((r) => ({ r, inc: incidents.find((i) => i.id === r.incidentId)! }))
    .sort((a, b) => (b.r.reviewedAt ?? "").localeCompare(a.r.reviewedAt ?? ""));

  return (
    <>
      <PageHeader title="التقارير" en="Reports" description="تقارير التقييم المتاحة للتحليلات التي تمت مراجعتها." />
      <div className="mb-4">
        <Notice tone="info">يمكن إصدار تقرير PDF نهائي فقط للتحليلات التي تم وضع علامة «تمت المراجعة» عليها.</Notice>
      </div>
      <Panel bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className={th}>رقم التقرير</th>
                <th className={th}>الحادثة</th>
                <th className={th}>الموقع</th>
                <th className={th}>المساحة المتأثرة</th>
                <th className={th}>تاريخ المراجعة</th>
                <th className={th}>المراجع</th>
                <th className={`${th} text-end`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(({ r, inc }) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className={`${td} ltr text-start font-mono text-[13px]`}>RPT-{r.id.slice(4)}</td>
                  <td className={td}>
                    <div className="font-medium">{inc.name}</div>
                    <div className="mt-1"><TypeBadge type={inc.type} /></div>
                  </td>
                  <td className={`${td} text-muted-foreground`}>{inc.location}</td>
                  <td className={`${td} ltr text-start font-mono text-[13px]`}>{formatKm2(r.affectedKm2)} km² · {r.affectedPct.toFixed(2)}%</td>
                  <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.reviewedAt}</td>
                  <td className={td}>{r.reviewer}</td>
                  <td className={`${td} text-end`}>
                    <div className="inline-flex gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/reports/$runId" params={{ runId: r.id }}><FileText /> معاينة</Link>
                      </Button>
                      <Button asChild size="sm" variant="soft">
                        <Link to="/reports/$runId" params={{ runId: r.id }} search={{ download: true }}><Download /> PDF</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
