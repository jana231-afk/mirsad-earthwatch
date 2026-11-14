import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, EmptyState, TypeBadge, AutoStatusBadge, DateRange, InfoRow, ExperimentalBadge, Notice } from "@/components/mirsad/bits";
import { MapViewer } from "@/components/mirsad/MapViewer";
import { AreaStats, AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { ComparisonSequence, ComparisonTable, comparisonSummary } from "@/components/mirsad/DailyComparison";
import { DayTabs } from "@/components/mirsad/DayTabs";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { REPORT_TYPE_LABELS, formatDate } from "@/lib/demo-data";
import { canViewReport } from "@/lib/demo-rules";

export const Route = createFileRoute("/_console/field/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "تفاصيل الحالة للمستجيب · مِرصاد" },
      { name: "description", content: "عرض للقراءة فقط لآخر نتيجة مراجَعة وخريطتها وإحصاءاتها." },
      { property: "og:title", content: "تفاصيل الحالة · مِرصاد" },
      { property: "og:description", content: "الخريطة والمساحة المتأثرة والمقارنة اليومية." },
    ],
  }),
  component: () => (<RoleGate allow={["responder"]}><FieldDetail /></RoleGate>),
});

function FieldDetail() {
  const { id } = Route.useParams();
  const { incidents, runs, reports } = useDemo();
  const inc = incidents.find((i) => i.id === id && i.sharedWithResponders);
  const run = inc && latestReviewedRun(runs, id);
  const [idx, setIdx] = useState(run ? run.days.length - 1 : 0);
  if (!inc) return <EmptyState title="الحالة غير متاحة">هذه الحالة غير مصرح بها لحسابك.</EmptyState>;
  const reps = reports.filter((r) => r.incidentId === id && canViewReport("responder", r, incidents, runs));
  const d = run?.days[Math.min(idx, run.days.length - 1)];
  return (
    <>
      <PageHeader title={inc.name} crumbs={[{ label: "الحالات المصرح بها", to: "/field" }, { label: inc.name }]}
        description={<span className="flex flex-wrap items-center gap-2"><TypeBadge type={inc.type} /><AutoStatusBadge incident={inc} /></span>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {!run || !d ? <EmptyState title="لا توجد نتيجة مراجَعة بعد" /> : (
            <>
              <DayTabs days={run.days} value={idx} onChange={setIdx} />
              <MapViewer key={d.imageId} {...d.layers} kind={inc.type} />
              <Panel title={<span className="flex items-center gap-2">إحصاءات المساحة – {formatDate(d.date)} {run.experimental && <ExperimentalBadge />}</span>}><AreaStats day={d} kind={inc.type} /></Panel>
              {run.days.length > 1 && (
                <Panel title="ملخص المقارنة اليومية">
                  <div className="space-y-3"><ComparisonSequence days={run.days} /><p className="text-sm text-muted-foreground">{comparisonSummary(run.days, inc.type)}</p><ComparisonTable days={run.days} compact /></div>
                </Panel>
              )}
              <Notice icon={<Info className="h-4 w-4" />}>{AREA_DISCLAIMER}</Notice>
            </>
          )}
        </div>
        <div className="space-y-6">
          <Panel title="معلومات الحالة"><dl>
            <InfoRow label="الموقع" value={inc.location} />
            <InfoRow label="الفترة (من – إلى)" value={<DateRange from={inc.startDate} to={inc.endDate} />} />
            {run && <InfoRow label="المراجع" value={run.reviewer ?? "—"} />}
            {run && <InfoRow label="النموذج" value={run.model} />}
          </dl></Panel>
          <Panel title="التقارير">
            {reps.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد تقارير.</p> : (
              <ul className="space-y-2">{reps.map((r) => (
                <li key={r.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{REPORT_TYPE_LABELS[r.type]}</div>
                  <div className="text-xs text-muted-foreground"><span className="ltr">{r.id}</span> · {formatDate(r.createdAt)}</div>
                  <div className="mt-2 flex gap-1.5">
                    <Button asChild size="sm" variant="outline"><Link to="/reports/$reportId" params={{ reportId: r.id }}><FileText /> عرض</Link></Button>
                    <Button asChild size="sm" variant="soft"><Link to="/reports/$reportId" params={{ reportId: r.id }} search={{ download: true }}><Download /> تحميل PDF</Link></Button>
                  </div>
                </li>))}</ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
