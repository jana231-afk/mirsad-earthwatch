import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  RoleGate,
  EmptyState,
  TypeBadge,
  IncidentStatusBadge,
  ExperimentalBadge,
  InfoRow,
  Notice,
} from "@/components/mirsad/bits";
import { MapViewer } from "@/components/mirsad/MapViewer";
import { AreaStats, AREA_DISCLAIMER } from "@/components/mirsad/RunSummary";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { TYPE_LABELS } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/field/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الحادثة (قراءة فقط) · MIRSAD" },
      { name: "description", content: "Read-only incident details, reviewed segmentation map and affected area statistics for field responders." },
      { property: "og:title", content: "Incident (Read-only) · MIRSAD" },
      { property: "og:description", content: "Reviewed analysis map and statistics for field responders." },
    ],
  }),
  component: () => (
    <RoleGate allow={["responder"]}>
      <FieldDetail />
    </RoleGate>
  ),
});

function FieldDetail() {
  const { id } = Route.useParams();
  const { incidents, runs, images } = useDemo();
  const inc = incidents.find((i) => i.id === id && i.sharedWithResponders);
  if (!inc) return <EmptyState title="الحادثة غير متاحة">هذه الحادثة غير مصرح بها لحسابك.</EmptyState>;
  const run = latestReviewedRun(runs, id);
  const post = run && images.find((m) => run.imageIds.includes(m.id) && m.imageRole !== "pre-event");

  return (
    <>
      <PageHeader
        crumbs={[{ label: "الحوادث المصرح بها", to: "/field" }, { label: inc.name }]}
        title={inc.name}
        en={inc.nameEn || undefined}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <TypeBadge type={inc.type} />
            <IncidentStatusBadge status={inc.status} />
            <span className="inline-flex items-center gap-1 text-xs"><Lock className="h-3 w-3" /> قراءة فقط</span>
          </span>
        }
        actions={
          run && (
            <>
              <Button asChild variant="outline">
                <Link to="/reports/$runId" params={{ runId: run.id }}><FileText /> عرض التقرير</Link>
              </Button>
              <Button asChild>
                <Link to="/reports/$runId" params={{ runId: run.id }} search={{ download: true }}><Download /> تنزيل PDF</Link>
              </Button>
            </>
          )
        }
      />

      {!run ? (
        <EmptyState title="لا توجد نتيجة معتمدة لهذه الحادثة بعد">ستظهر النتيجة هنا بعد مراجعتها من المحلل.</EmptyState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">خريطة النتيجة المعتمدة <span className="ltr text-xs font-normal text-muted-foreground">Reviewed segmentation overlay</span></span>
              {run.experimental && <ExperimentalBadge />}
            </div>
            <MapViewer base={run.layers.base} mask={run.layers.mask} nodata={run.layers.nodata} kind={inc.type} />
          </div>
          <div className="space-y-6">
            <Panel title="إحصاءات المساحة" en="Affected area statistics">
              <AreaStats run={run} kind={inc.type} />
              <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {AREA_DISCLAIMER}
              </div>
            </Panel>
            <Panel title="بيانات الحادثة والتحليل" en="Incident & analysis">
              <dl>
                <InfoRow label="رقم الحادثة" value={inc.id} mono />
                <InfoRow label="النوع" value={TYPE_LABELS[inc.type].ar} />
                <InfoRow label="الموقع" value={inc.location} />
                <InfoRow label="تاريخ الحادثة" value={inc.date} mono />
                {post && <InfoRow label="تاريخ التقاط الصورة" value={post.acquisitionDate} mono />}
                <InfoRow label="النموذج" value={`${run.model} ${run.modelVersion}`} mono />
                <InfoRow label="تاريخ المراجعة" value={run.reviewedAt} mono />
              </dl>
              {inc.description && <p className="mt-3 text-sm text-muted-foreground">{inc.description}</p>}
            </Panel>
            <Notice tone="success">هذه النتيجة تمت مراجعتها واعتمادها من محلل نظم المعلومات الجغرافية.</Notice>
          </div>
        </div>
      )}
    </>
  );
}
