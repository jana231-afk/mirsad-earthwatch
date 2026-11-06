import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, RotateCcw, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  RoleGate,
  EmptyState,
  RunStatusBadge,
  ExperimentalBadge,
  TypeBadge,
  Notice,
} from "@/components/mirsad/bits";
import { MapViewer } from "@/components/mirsad/MapViewer";
import { AreaStats, RunInfo } from "@/components/mirsad/RunSummary";
import { demoActions, useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/review/$runId")({
  head: () => ({
    meta: [
      { title: "مراجعة المحلل · MIRSAD" },
      { name: "description", content: "GIS analyst review of a segmentation result: compare with the original image, add notes and approve." },
      { property: "og:title", content: "Analyst Review · MIRSAD" },
      { property: "og:description", content: "Mark analysis results as reviewed or needing correction." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <ReviewPage />
    </RoleGate>
  ),
});

function ReviewPage() {
  const { runId } = Route.useParams();
  const { runs, incidents, images, userName } = useDemo();
  const run = runs.find((r) => r.id === runId);
  const [notes, setNotes] = useState(run?.reviewNotes ?? "");
  const [err, setErr] = useState("");
  if (!run) return <EmptyState title="التحليل غير موجود" />;
  const inc = incidents.find((i) => i.id === run.incidentId)!;
  const runImages = images.filter((m) => run.imageIds.includes(m.id));
  const warnings = runImages.flatMap((m) => m.warnings.map((w) => ({ id: m.id, w })));

  const act = (status: "reviewed" | "correction") => {
    if (status === "correction" && !notes.trim()) {
      setErr("يرجى كتابة ملاحظات توضح التصحيح المطلوب.");
      return;
    }
    setErr("");
    demoActions.reviewRun(run.id, status, notes.trim(), userName);
    toast.success(status === "reviewed" ? "تم اعتماد النتيجة" : "تم تحديد النتيجة كـ «يحتاج تصحيح»", {
      description: status === "reviewed" ? "أصبحت النتيجة مرئية للمستجيبين الميدانيين المصرح لهم." : "لن تظهر النتيجة للمستجيبين.",
    });
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "الحوادث", to: "/incidents" },
          { label: inc.name, to: "/incidents/$id", params: { id: inc.id } },
          { label: `مراجعة ${run.id}` },
        ]}
        title="مراجعة المحلل"
        en="Analyst Review"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="ltr font-mono text-xs">{run.id}</span>
            <TypeBadge type={inc.type} />
            <span>الحالة الحالية:</span>
            <RunStatusBadge status={run.status} />
            {run.experimental && <ExperimentalBadge />}
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/results/$runId" params={{ runId: run.id }}>
              <Eye /> صفحة النتائج
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold">الصورة الأصلية <span className="ltr text-xs font-normal text-muted-foreground">Original image</span></div>
          <MapViewer base={run.layers.base} nodata={run.layers.nodata} kind={inc.type} showLegend={false} />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">نتيجة التجزئة <span className="ltr text-xs font-normal text-muted-foreground">Segmentation result</span></div>
          <MapViewer base={run.layers.base} mask={run.layers.mask} nodata={run.layers.nodata} kind={inc.type} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="إحصاءات المساحة" en="Area statistics">
          <AreaStats run={run} kind={inc.type} />
        </Panel>

        <Panel title="معلومات التحليل" en="Analysis information">
          <RunInfo run={run} images={runImages} />
        </Panel>

        <div className="space-y-6">
          <Panel title="تحذيرات التحقق من الصورة" en="Image validation warnings">
            {warnings.length === 0 ? (
              <Notice tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>لا توجد تحذيرات.</Notice>
            ) : (
              <div className="space-y-2">
                {warnings.map(({ id, w }) => (
                  <Notice key={id + w} tone="warning" icon={<AlertTriangle className="h-4 w-4" />}>
                    <span className="ltr me-1 font-mono text-[11px]">{id}</span> {w}
                  </Notice>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="قرار المراجعة" en="Review decision">
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">ملاحظات المراجعة <span className="ltr text-xs text-muted-foreground">Review notes</span></label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="مثال: الحدود متوافقة مع الصورة، مع وجود بقع صغيرة مصنفة خطأً على المرتفعات…"
              className="field h-auto py-2"
            />
            {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
            <div className="mt-4 grid gap-2">
              <Button variant="success" size="lg" onClick={() => act("reviewed")}>
                <CheckCircle2 /> تمت المراجعة · Mark as Reviewed
              </Button>
              <Button variant="outline-destructive" size="lg" onClick={() => act("correction")}>
                <RotateCcw /> يحتاج تصحيح · Needs Correction
              </Button>
            </div>
            {run.reviewedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                آخر مراجعة: {run.reviewer} · <span className="ltr font-mono">{run.reviewedAt}</span>
              </p>
            )}
            {run.status === "reviewed" && (
              <Button asChild variant="soft" className="mt-3 w-full">
                <Link to="/reports/$runId" params={{ runId: run.id }}>
                  <FileText /> إنشاء تقرير PDF
                </Link>
              </Button>
            )}
          </Panel>
          <Notice tone="info">النتائج المعتمدة («تمت المراجعة») فقط تظهر للمستجيبين الميدانيين.</Notice>
        </div>
      </div>
    </>
  );
}
