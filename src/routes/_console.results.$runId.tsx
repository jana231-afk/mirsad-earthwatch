import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardCheck, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, EmptyState, RunStatusBadge, ExperimentalBadge, TypeBadge, Notice } from "@/components/mirsad/bits";
import { MapViewer, ImageThumb } from "@/components/mirsad/MapViewer";
import { AreaStats, RunInfo, AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { ComparisonChart, ComparisonSequence, ComparisonTable, comparisonSummary } from "@/components/mirsad/DailyComparison";
import { DayTabs } from "@/components/mirsad/DayTabs";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/results/$runId")({
  validateSearch: (s: Record<string, unknown>): { day?: number | undefined } => ({
    day: Number.isInteger(Number(s["day"])) && s["day"] !== undefined ? Number(s["day"]) : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "نتائج التحليل · مِرصاد" },
      { name: "description", content: "خريطة نتيجة التحليل والمساحة المتأثرة والمقارنة بين الصور." },
      { property: "og:title", content: "نتائج التحليل · مِرصاد" },
      { property: "og:description", content: "قناع التقسيم والإحصاءات والمقارنة اليومية." },
    ],
  }),
  component: () => (<RoleGate allow={["analyst"]}><Results /></RoleGate>),
});

function Results() {
  const { runId } = Route.useParams();
  const { day } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { runs, incidents, images } = useDemo();
  const run = runs.find((r) => r.id === runId);
  const inc = run && incidents.find((i) => i.id === run.incidentId);
  if (!run || !inc) return <EmptyState title="التحليل غير موجود" />;
  const idx = Math.min(Math.max(day ?? run.days.length - 1, 0), run.days.length - 1);
  const d = run.days[idx]!;
  const setDay = (i: number) => navigate({ search: { day: i }, replace: true });
  const preImg = images.find((m) => run.imageIds.includes(m.id) && m.imageRole === "pre");

  return (
    <>
      <PageHeader
        title="نتائج التحليل"
        crumbs={[{ label: "سجل التحليلات", to: "/history" }, { label: inc.name, to: "/incidents/$id", params: { id: inc.id } }, { label: run.id }]}
        description={<span className="flex flex-wrap items-center gap-2">{inc.name} <TypeBadge type={inc.type} /> <RunStatusBadge status={run.status} /> {run.experimental && <ExperimentalBadge />}</span>}
        actions={run.status === "reviewed"
          ? <Button asChild><Link to="/reports" search={{ incident: inc.id }}><FileText /> إنشاء تقرير</Link></Button>
          : <Button asChild variant="navy"><Link to="/review/$runId" params={{ runId }}><ClipboardCheck /> مراجعة النتيجة</Link></Button>}
      />
      <div className="mb-4"><DayTabs days={run.days} value={idx} onChange={setDay} /></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <MapViewer key={d.imageId} {...d.layers} kind={inc.type} />
          {preImg && <Panel title="صورة قبل الحدث (مرجع)"><div className="max-w-sm"><ImageThumb src={preImg.preview} label={preImg.acquisitionDate} /></div></Panel>}
        </div>
        <div className="space-y-6">
          <Panel title="الإحصاءات"><AreaStats day={d} kind={inc.type} /></Panel>
          <Panel title="معلومات التحليل"><RunInfo run={run} images={images} day={d} /></Panel>
        </div>
      </div>
      {run.days.length > 1 && (
        <Panel title="المقارنة بين الصور" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ComparisonChart days={run.days} kind={inc.type} activeIndex={idx} onSelect={setDay} />
            <div className="space-y-4">
              <ComparisonSequence days={run.days} />
              <p className="text-sm text-muted-foreground">{comparisonSummary(run.days, inc.type)}</p>
              <ComparisonTable days={run.days} compact />
            </div>
          </div>
        </Panel>
      )}
      <div className="mt-6"><Notice icon={<Info className="h-4 w-4" />}>{AREA_DISCLAIMER}</Notice></div>
    </>
  );
}
