import { createFileRoute, Link } from "@tanstack/react-router";
import { UploadCloud, Play, FileText, Pencil, Eye, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader, Panel, RoleGate, EmptyState, TypeBadge, AutoStatusBadge, AutoStatusNote, DateRange, InfoRow, RunStatusBadge, ExperimentalBadge, th, td,
} from "@/components/mirsad/bits";
import { MapViewer } from "@/components/mirsad/MapViewer";
import { AreaStats } from "@/components/mirsad/RunSummary";
import { ComparisonSequence } from "@/components/mirsad/DailyComparison";
import { incidentImages, latestReviewedRun, useDemo } from "@/lib/demo-store";
import { IMAGE_ROLE_LABELS, daysBetween, formatDate, latestDay } from "@/lib/demo-data";

export const Route = createFileRoute("/_console/incidents/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "تفاصيل الحالة · مِرصاد" },
      { name: "description", content: "بيانات الحالة والصور المرفوعة والتحليلات السابقة وآخر نتيجة مراجَعة." },
      { property: "og:title", content: "تفاصيل الحالة · مِرصاد" },
      { property: "og:description", content: "الصور والتحليلات ونتيجة المراجعة لحالة كارثة." },
    ],
  }),
  component: () => (
    <RoleGate allow={["analyst"]}>
      <IncidentDetail />
    </RoleGate>
  ),
});

function IncidentDetail() {
  const { id } = Route.useParams();
  const { incidents, images, runs } = useDemo();
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return <EmptyState title="الحالة غير موجودة" />;
  const imgs = incidentImages(images, id);
  const incRuns = runs.filter((r) => r.incidentId === id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const reviewed = latestReviewedRun(runs, id);
  const days = daysBetween(inc.startDate, inc.endDate);

  return (
    <>
      <PageHeader
        title={inc.name}
        crumbs={[{ label: "الحالات", to: "/incidents" }, { label: inc.name }]}
        description={<span className="flex flex-wrap items-center gap-2"><TypeBadge type={inc.type} /><AutoStatusBadge incident={inc} /><span className="ltr text-xs">{inc.id}</span></span>}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/upload" search={{ incident: id }}><UploadCloud /> رفع صورة جديدة</Link></Button>
            {imgs.length > 0 ? (
              <Button asChild variant="navy"><Link to="/incidents/$id/analyze" params={{ id }}><Play className="rtl:rotate-180" /> بدء التحليل</Link></Button>
            ) : (
              <Button variant="navy" disabled title="ارفع صورة أولاً"><Play className="rtl:rotate-180" /> بدء التحليل</Button>
            )}
            {reviewed ? (
              <Button asChild><Link to="/reports" search={{ incident: id }}><FileText /> إنشاء تقرير</Link></Button>
            ) : (
              <Button disabled title="يتطلب تحليلاً تمت مراجعته"><FileText /> إنشاء تقرير</Button>
            )}
            <Button asChild variant="ghost"><Link to="/incidents/$id/edit" params={{ id }}><Pencil /> تعديل</Link></Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Panel title="معلومات الحالة">
            <dl>
              <InfoRow label="نوع الكارثة" value={<TypeBadge type={inc.type} />} />
              <InfoRow label="الموقع" value={inc.location} />
              <InfoRow label="المنطقة" value={inc.region} />
              <InfoRow label="فترة الحالة (من – إلى)" value={<DateRange from={inc.startDate} to={inc.endDate} />} />
              <InfoRow label="المدة" value={days === 1 ? "يوم واحد" : `${days} أيام`} />
              <InfoRow label="الحالة" value={<AutoStatusBadge incident={inc} />} />
              <InfoRow label="متاحة للمستجيبين" value={inc.sharedWithResponders ? "نعم" : "لا"} />
              <InfoRow label="أنشأها" value={inc.createdBy} />
            </dl>
            {inc.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{inc.description}</p>}
            <AutoStatusNote className="mt-4" />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="آخر تحليل مراجَع">
            {!reviewed ? (
              <EmptyState title="لا يوجد تحليل مراجَع بعد">شغّل التحليل ثم راجع النتيجة لاعتمادها.</EmptyState>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                <MapViewer {...latestDay(reviewed).layers} kind={inc.type} showLayerPanel={false} />
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="ltr font-mono">{reviewed.id}</span>
                    <RunStatusBadge status={reviewed.status} />
                    {reviewed.experimental && <ExperimentalBadge />}
                  </div>
                  <div className="text-xs text-muted-foreground">صورة {formatDate(latestDay(reviewed).date)} · {reviewed.model}</div>
                  <AreaStats day={latestDay(reviewed)} kind={inc.type} />
                  {reviewed.days.length > 1 && (
                    <div className="rounded-md border bg-muted/40 p-3">
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">المقارنة بين الأيام</div>
                      <ComparisonSequence days={reviewed.days} />
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm"><Link to="/results/$runId" params={{ runId: reviewed.id }}><Eye /> عرض النتائج كاملة</Link></Button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title={`الصور المرفوعة (${imgs.length})`} bodyClassName="p-0">
            {imgs.length === 0 ? (
              <div className="p-5"><EmptyState title="لم تُرفع صور بعد" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className={th}>اسم الملف</th>
                      <th className={th}>تاريخ الالتقاط</th>
                      <th className={th}>نوع الصورة</th>
                      {inc.type === "fire" && <th className={th}>الدور</th>}
                      <th className={th}>التحقق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {imgs.map((m) => (
                      <tr key={m.id}>
                        <td className={`${td} ltr text-start font-mono text-xs`}>{m.fileName}</td>
                        <td className={`${td} whitespace-nowrap`}>
                          {formatDate(m.acquisitionDate)}
                          {m.acquisitionDateSource === "manual" && <span className="ms-1 text-xs text-muted-foreground">(يدوي)</span>}
                        </td>
                        <td className={td}>{m.sensor}</td>
                        {inc.type === "fire" && <td className={td}>{IMAGE_ROLE_LABELS[m.imageRole]}</td>}
                        <td className={td}>
                          {m.status === "valid" ? (
                            <span className="text-xs text-success">صالحة</span>
                          ) : (
                            <span className="text-xs text-warning-foreground" title={m.warnings.join("\n")}>صالحة مع تنبيهات ({m.warnings.length})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="التحليلات السابقة" bodyClassName="p-0">
            {incRuns.length === 0 ? (
              <div className="p-5"><EmptyState title="لا توجد تحليلات لهذه الحالة" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className={th}>رقم التحليل</th>
                      <th className={th}>تاريخ التحليل</th>
                      <th className={th}>عدد الصور</th>
                      <th className={th}>حالة المراجعة</th>
                      <th className={th}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {incRuns.map((r) => (
                      <tr key={r.id}>
                        <td className={`${td} ltr text-start font-mono text-xs`}>{r.id}</td>
                        <td className={td}>{formatDate(r.startedAt)}</td>
                        <td className={td}>{r.days.length}</td>
                        <td className={td}><RunStatusBadge status={r.status} /></td>
                        <td className={`${td} text-end`}>
                          <div className="inline-flex gap-1.5">
                            <Button asChild size="sm" variant="outline"><Link to="/results/$runId" params={{ runId: r.id }}><Eye /> النتائج</Link></Button>
                            <Button asChild size="sm" variant="ghost"><Link to="/review/$runId" params={{ runId: r.id }}><ClipboardCheck /> مراجعة</Link></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
