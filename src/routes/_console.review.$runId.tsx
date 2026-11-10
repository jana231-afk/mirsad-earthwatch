import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, RoleGate, EmptyState, RunStatusBadge, ExperimentalBadge, Notice } from "@/components/mirsad/bits";
import { MapViewer, ImageThumb } from "@/components/mirsad/MapViewer";
import { AreaStats, RunInfo } from "@/components/mirsad/RunSummary";
import { DayTabs } from "@/components/mirsad/DayTabs";
import { demoActions, useDemo } from "@/lib/demo-store";
import { formatDate } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/review/$runId")({
  head: () => ({
    meta: [
      { title: "مراجعة المحلل · مِرصاد" },
      { name: "description", content: "مراجعة نتيجة التحليل الآلي واعتمادها أو طلب تصحيحها." },
      { property: "og:title", content: "مراجعة المحلل · مِرصاد" },
      { property: "og:description", content: "اعتماد نتيجة التحليل قبل مشاركتها." },
    ],
  }),
  component: () => (<RoleGate allow={["analyst"]}><Review /></RoleGate>),
});

function Review() {
  const { runId } = Route.useParams();
  const navigate = useNavigate();
  const { runs, incidents, images, userName } = useDemo();
  const run = runs.find((r) => r.id === runId);
  const [idx, setIdx] = useState(run ? run.days.length - 1 : 0);
  const [notes, setNotes] = useState(run?.reviewNotes ?? "");
  const [err, setErr] = useState("");
  const inc = run && incidents.find((i) => i.id === run.incidentId);
  if (!run || !inc) return <EmptyState title="التحليل غير موجود" />;
  const d = run.days[Math.min(idx, run.days.length - 1)]!;
  const img = images.find((m) => m.id === d.imageId);
  const warnings = images.filter((m) => run.imageIds.includes(m.id)).flatMap((m) => m.warnings.map((w) => `${formatDate(m.acquisitionDate)}: ${w}`));

  const act = (status: "reviewed" | "correction") => {
    if (status === "correction" && !notes.trim()) { setErr("يرجى كتابة ملاحظة توضح المطلوب تصحيحه."); return; }
    demoActions.reviewRun(run.id, status, notes.trim(), userName);
    toast.success(status === "reviewed" ? "تم اعتماد النتيجة كمراجَعة" : "تم تحديد النتيجة كتحتاج إلى تصحيح");
    navigate({ to: "/results/$runId", params: { runId: run.id }, search: {} });
  };

  return (
    <>
      <PageHeader title="مراجعة المحلل" crumbs={[{ label: "سجل التحليلات", to: "/history" }, { label: run.id }]}
        description={<span className="flex flex-wrap items-center gap-2">{inc.name} <RunStatusBadge status={run.status} /> {run.experimental && <ExperimentalBadge />}</span>} />
      <div className="mb-4"><DayTabs days={run.days} value={idx} onChange={setIdx} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="الصورة الأصلية">{img && <ImageThumb src={d.layers.base} label={formatDate(d.date)} />}</Panel>
        <Panel title="النتيجة"><MapViewer key={d.imageId} {...d.layers} kind={inc.type} showLayerPanel={false} /></Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="الإحصاءات"><AreaStats day={d} kind={inc.type} /></Panel>
        <Panel title="معلومات التحليل"><RunInfo run={run} images={images} day={d} /></Panel>
        <Panel title="قرار المراجعة">
          <div className="space-y-3">
            {warnings.length > 0 && <Notice tone="warning" title="تنبيهات التحقق" icon={<AlertTriangle className="h-4 w-4" />}><ul className="list-disc space-y-1 ps-4">{warnings.map((w) => <li key={w}>{w}</li>)}</ul></Notice>}
            <label className="block space-y-1.5 text-sm"><span className="font-medium">ملاحظات المراجعة</span>
              <textarea rows={5} maxLength={1000} value={notes} onChange={(e) => { setNotes(e.target.value); setErr(""); }} className="field h-auto py-2" />
            </label>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <Button variant="success" onClick={() => act("reviewed")}><CheckCircle2 /> اعتماد كمراجَع</Button>
              <Button variant="outline-destructive" onClick={() => act("correction")}><AlertTriangle /> يحتاج إلى تصحيح</Button>
            </div>
            <p className="flex gap-1.5 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5 shrink-0" /> تظهر للمستجيبين الميدانيين النتائج المراجَعة فقط.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
