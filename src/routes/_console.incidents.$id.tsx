import { createFileRoute, Link } from "@tanstack/react-router";
import { UploadCloud, Play, Pencil, FileText, BarChart3, ClipboardCheck, AlertTriangle, CheckCircle2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  Panel,
  TypeBadge,
  IncidentStatusBadge,
  RunStatusBadge,
  ExperimentalBadge,
  InfoRow,
  RoleGate,
  EmptyState,
  th,
  td,
} from "@/components/mirsad/bits";
import { ImageThumb, MapViewer } from "@/components/mirsad/MapViewer";
import { latestReviewedRun, useDemo } from "@/lib/demo-store";
import { IMAGE_ROLE_LABELS, TYPE_LABELS, formatKm2 } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/incidents/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الحادثة · MIRSAD" },
      { name: "description", content: "Incident details with uploaded satellite images, analysis runs and the latest reviewed result." },
      { property: "og:title", content: "Incident Details · MIRSAD" },
      { property: "og:description", content: "Satellite images and analysis runs linked to one incident." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <IncidentDetails />
    </RoleGate>
  ),
});

function IncidentDetails() {
  const { id } = Route.useParams();
  const { incidents, images, runs } = useDemo();
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return <EmptyState title="الحادثة غير موجودة">تحقق من رقم الحادثة.</EmptyState>;

  const imgs = images.filter((m) => m.incidentId === id);
  const incRuns = runs.filter((r) => r.incidentId === id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const latest = latestReviewedRun(runs, id);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "الحوادث", to: "/incidents" }, { label: inc.name }]}
        title={inc.name}
        en={inc.nameEn || undefined}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="ltr font-mono text-xs">{inc.id}</span>
            <TypeBadge type={inc.type} />
            <IncidentStatusBadge status={inc.status} />
          </span>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/incidents/$id/edit" params={{ id }}>
                <Pencil /> تعديل
              </Link>
            </Button>
            <Button asChild variant="navy">
              <Link to="/upload" search={{ incident: id }}>
                <UploadCloud /> رفع صورة فضائية جديدة
              </Link>
            </Button>
            <Button asChild disabled={imgs.length === 0}>
              <Link to="/incidents/$id/analyze" params={{ id }}>
                <Play className="rtl:rotate-180" /> بدء التحليل
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="معلومات الحادثة" en="Incident information">
          <dl>
            <InfoRow label="رقم الحادثة" value={inc.id} mono />
            <InfoRow label="النوع" value={`${TYPE_LABELS[inc.type].ar}`} />
            <InfoRow label="الموقع" value={inc.location} />
            {inc.region && <InfoRow label="المنطقة" value={inc.region} />}
            <InfoRow label="تاريخ الحادثة" value={inc.date} mono />
            <InfoRow label="أنشأها" value={inc.createdBy} />
            <InfoRow
              label="متاحة للمستجيبين"
              value={inc.sharedWithResponders ? "نعم · Yes" : "لا · No"}
            />
          </dl>
          {inc.description && (
            <p className="mt-4 rounded-md bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">{inc.description}</p>
          )}
        </Panel>

        <Panel
          title="أحدث تحليل تمت مراجعته"
          en="Latest reviewed analysis"
          actions={latest && <span className="ltr font-mono text-xs text-muted-foreground">{latest.id}</span>}
        >
          {latest ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <MapViewer
                base={latest.layers.base}
                mask={latest.layers.mask}
                nodata={latest.layers.nodata}
                kind={inc.type}
                showLayerPanel={false}
              />
              <div className="flex flex-col gap-3">
                <div className="rounded-md border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">المساحة المتأثرة · Affected area</div>
                  <div className="ltr mt-1 text-end font-mono text-2xl font-semibold">
                    {formatKm2(latest.affectedKm2)} <span className="text-sm text-muted-foreground">km²</span>
                  </div>
                  <div className="ltr text-end font-mono text-sm text-muted-foreground">{latest.affectedPct.toFixed(2)}%</div>
                </div>
                <dl className="text-sm">
                  <InfoRow label="النموذج" value={`${latest.model} ${latest.modelVersion}`} mono />
                  <InfoRow label="روجع بواسطة" value={latest.reviewer} />
                  <InfoRow label="تاريخ المراجعة" value={latest.reviewedAt} mono />
                </dl>
                {latest.experimental && <ExperimentalBadge />}
                <div className="mt-auto grid gap-2">
                  <Button asChild variant="outline">
                    <Link to="/results/$runId" params={{ runId: latest.id }}>
                      <BarChart3 /> عرض النتائج
                    </Link>
                  </Button>
                  <Button asChild variant="soft">
                    <Link to="/reports/$runId" params={{ runId: latest.id }}>
                      <FileText /> معاينة التقرير
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="لا يوجد تحليل معتمد بعد">
              شغّل التحليل وراجع النتيجة لتظهر هنا وللمستجيبين الميدانيين.
            </EmptyState>
          )}
        </Panel>
      </div>

      <Panel
        title="صور الأقمار الصناعية المرفوعة"
        en="Uploaded satellite images"
        className="mt-6"
        actions={<span className="text-xs text-muted-foreground">{imgs.length} صورة</span>}
      >
        {imgs.length === 0 ? (
          <EmptyState title="لم تُرفع أي صورة بعد">
            <div className="mt-3 flex justify-center">
              <Button asChild variant="navy" size="sm">
                <Link to="/upload" search={{ incident: id }}>
                  <UploadCloud /> رفع صورة GeoTIFF
                </Link>
              </Button>
            </div>
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {imgs.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg border">
                <ImageThumb src={m.preview} label={IMAGE_ROLE_LABELS[m.imageRole]} className="rounded-none border-0 border-b" />
                <div className="space-y-2 p-4">
                  <div className="ltr truncate text-start font-mono text-xs" title={m.fileName}>{m.fileName}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="ltr">{m.sensor}</span>·<span className="ltr font-mono">{m.acquisitionDate}</span>·
                    <span className="ltr font-mono">{m.sizeMB} MB</span>
                  </div>
                  {m.status === "valid" ? (
                    <Badge variant="reviewed" className="gap-1"><CheckCircle2 className="h-3 w-3" /> صالحة · Valid</Badge>
                  ) : m.status === "warning" ? (
                    <Badge variant="pending" className="gap-1"><AlertTriangle className="h-3 w-3" /> صالحة مع تحذيرات ({m.warnings.length})</Badge>
                  ) : (
                    <Badge variant="correction" className="gap-1"><ImageOff className="h-3 w-3" /> غير مدعومة</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="عمليات التحليل السابقة"
        en="Analysis runs"
        className="mt-6"
        bodyClassName="p-0"
        actions={<span className="text-xs text-muted-foreground">جميع التحليلات مرتبطة بهذه الحادثة</span>}
      >
        {incRuns.length === 0 ? (
          <div className="p-5"><EmptyState title="لا توجد عمليات تحليل" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className={th}>رقم التحليل</th>
                  <th className={th}>الصورة</th>
                  <th className={th}>النموذج</th>
                  <th className={th}>تاريخ التشغيل</th>
                  <th className={th}>المساحة المتأثرة</th>
                  <th className={th}>الحالة</th>
                  <th className={`${th} text-end`}>الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {incRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.id}</td>
                    <td className={`${td} ltr text-start font-mono text-xs text-muted-foreground`}>{r.imageIds.join(" + ")}</td>
                    <td className={td}>
                      <div className="ltr text-start text-[13px]">{r.model}</div>
                      <div className="ltr text-start font-mono text-[11px] text-muted-foreground">{r.modelVersion}</div>
                    </td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{r.startedAt}</td>
                    <td className={`${td} ltr text-start font-mono text-[13px]`}>{formatKm2(r.affectedKm2)} km²</td>
                    <td className={td}><RunStatusBadge status={r.status} /></td>
                    <td className={`${td} text-end`}>
                      <div className="inline-flex gap-1.5">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/results/$runId" params={{ runId: r.id }}>
                            <BarChart3 /> النتائج
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/review/$runId" params={{ runId: r.id }}>
                            <ClipboardCheck /> مراجعة
                          </Link>
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
