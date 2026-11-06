import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, FileText, Info } from "lucide-react";
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
import { BinaryMask, ImageThumb, MapLegend, MapViewer } from "@/components/mirsad/MapViewer";
import { AreaStats, RunInfo, AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/_console/results/$runId")({
  head: () => ({
    meta: [
      { title: "نتائج التحليل · MIRSAD" },
      { name: "description", content: "Segmentation mask overlay, affected area in km², percentage and model information for an analysis run." },
      { property: "og:title", content: "Analysis Results · MIRSAD" },
      { property: "og:description", content: "Map overlay and area statistics for a segmentation run." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <ResultsPage />
    </RoleGate>
  ),
});

function ResultsPage() {
  const { runId } = Route.useParams();
  const { runs, incidents, images } = useDemo();
  const run = runs.find((r) => r.id === runId);
  if (!run) return <EmptyState title="التحليل غير موجود" />;
  const inc = incidents.find((i) => i.id === run.incidentId)!;
  const runImages = images.filter((m) => run.imageIds.includes(m.id));

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "الحوادث", to: "/incidents" },
          { label: inc.name, to: "/incidents/$id", params: { id: inc.id } },
          { label: `نتائج ${run.id}` },
        ]}
        title="نتائج التحليل"
        en="Analysis Results"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="ltr font-mono text-xs">{run.id}</span>
            <TypeBadge type={inc.type} />
            <RunStatusBadge status={run.status} />
            {run.experimental && <ExperimentalBadge />}
          </span>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/review/$runId" params={{ runId: run.id }}>
                <ClipboardCheck /> مراجعة النتيجة
              </Link>
            </Button>
            <Button asChild disabled={run.status !== "reviewed"}>
              <Link to="/reports/$runId" params={{ runId: run.id }}>
                <FileText /> معاينة التقرير
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <MapViewer
            base={run.layers.base}
            mask={run.layers.mask}
            nodata={run.layers.nodata}
            kind={inc.type}
            caption="اسحب للتحريك بعد التكبير"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {run.layers.pre && <ImageThumb src={run.layers.pre} label="قبل الحدث · Pre-event" />}
            <ImageThumb src={run.layers.base} label={run.layers.pre ? "بعد الحدث · Post-event" : "الصورة الأصلية · Original"} />
            <BinaryMask mask={run.layers.mask} nodata={run.layers.nodata} label="قناع التجزئة · Mask" />
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="إحصاءات المساحة" en="Area statistics">
            <AreaStats run={run} kind={inc.type} />
            <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {AREA_DISCLAIMER}
            </div>
          </Panel>
          <Panel title="مفتاح الخريطة" en="Legend">
            <MapLegend kind={inc.type} hasNodata={!!run.layers.nodata} className="text-sm" />
          </Panel>
          <Panel title="معلومات التحليل" en="Analysis information">
            <RunInfo run={run} images={runImages} />
          </Panel>
          {run.status !== "reviewed" && (
            <Notice tone="warning" title="لم تُعتمد بعد">
              هذه النتيجة غير مرئية للمستجيبين الميدانيين حتى يتم وضع علامة «تمت المراجعة».
            </Notice>
          )}
        </div>
      </div>
    </>
  );
}
